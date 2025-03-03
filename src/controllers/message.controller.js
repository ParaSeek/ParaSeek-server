import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Company from "../models/company.model.js";
import FriendReq from "../models/friendReq.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";

// ✅ Send a friend request – Users can send a request to connect with another user.
const sendFriendReq = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) {
    throw new ApiError(400, "pls provide the username");
  }

  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userId = user._id;
  //check if req already sent
  const friendReq = await FriendReq.findOne({
    $and: [
      { sender: req.user._id },
      { receiver: userId }]
  })
  console.log(friendReq);

  if (friendReq) {
    throw new ApiError(400, "You have already sent a friend request");
  }
  await FriendReq.create({
    sender: req.user._id,
    receiver: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { userId }, "Req send successfully"));
});

// ✅ Accept/Reject a friend request – Users can accept pending friend requests.
const acceptFriendReq = asyncHandler(async (req, res) => {
  const { senderUserId } = req.params;
  const { answer } = req.body;

  if (!senderUserId) {
    throw new ApiError(400, "pls provide the userId");
  }

  if (answer) {
    await Conversation.create({
      participantOne: req.user._id,
      participantTwo: senderUserId,
    });
  }

  await FriendReq.findOneAndDelete({ $and: [{ sender: senderUserId }, { receiver: req.user._id }] });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Response saved successfully"));
});

// ✅ Cancel a friend request – Users can cancel sent friend requests.
const withdrowReq = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;
  if (!senderUserId) {
    throw new ApiError(400, "pls provide the userId");
  }
  await FriendReq.findByIdAndDelete({ receiver: receiverId });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Withdrow your request successfully"));
});

// ✅ Unfriend a user – Remove a user from the friend list.
const unFriend = asyncHandler(async (req, res) => {
  const { userId } = req.user._id;
  const { friendId } = req.body; // The friend to unfriend

  // Find and delete the conversation where both users are participants
  const deletedConversation = await Conversation.findOneAndDelete({
    $or: [
      { participantOne: userId, participantTwo: friendId },
      { participantOne: friendId, participantTwo: userId },
    ],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, deletedConversation, "unfriend successfully"));
});

// ✅ Block a user – Prevent a user from sending messages or interacting.
const banUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "pls provide the userId");
  }

  const user = await User.findById(req.user._id);
  if (user.bannedUser.includes(userId)) {
    throw new ApiError(400, "You already ban this user");
  }

  user.bannedUser.push(userId);
  await user.save();

  return res.status(200).json(new ApiResponse(200, user, "You ban this user"));
});

// ✅ Unblock a user – Remove the block restriction and restore interaction.
const unBanUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "pls provide the userId");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { bannedUser: userId } }, // Correct $pull usage
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "You unBan this user"));
});

// ✅ Get all friends – Fetch the list of connected friends.
const getAllFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Logged-in user

  // Find all conversations where the user is a participant
  const conversations = await Conversation.find({
    $or: [{ participantOne: userId }, { participantTwo: userId }],
  });

  if (!conversations.length) {
    throw new ApiError(400, "No friends found");
  }

  // Extract friend IDs (other participant in each conversation)
  const friendIds = conversations.map((conv) =>
    conv.participantOne.equals(userId)
      ? conv.participantTwo
      : conv.participantOne
  );

  // Get friend details
  const friends = await User.find({ _id: { $in: friendIds } }).select(
    "username firstName lastName profilePic"
  );

  res
    .status(200)
    .json(new ApiResponse(200, friends, "Friends list retrieved successfully"));
});

// ✅ Get all pending friend requests – See a list of incoming friend requests.
const pendingReq = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const requests = await FriendReq.find({ receiver: userId }).populate({ path: "sender", select: "username profilePic firstName lastName" });

  if (requests.length <= 0) {
    throw new ApiError(400, "no pending req");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, requests, "get all pending requests"));
});

// ✅ Load all messages in a conversation – Fetch all messages between two users.
const getAllMessages = asyncHandler(async (req, res) => {
  const { friendUsername } = req.params;
  const user = await User.findOne({ username: friendUsername });
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  const friendId = user._id;

  if (!friendId) {
    throw new ApiError(400, "Pls provide the id");
  }

  const messages = await Conversation.findOne({
    $or: [
      { participantOne: req.user._id, participantTwo: friendId },
      { participantOne: friendId, participantTwo: req.user._id },
    ],
  })
    .populate({
      path: "participantOne participantTwo",
      select: "username profilePic firstName lastName",
    })
    .populate(
      {
        path: "messages", options: {
          sort: { updatedAt: -1 }
        }
      }
    );

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "get all message"));
});

// Messaging Features (1-on-1)
// ✅ Send a message to a friend – Users can send text messages to friends.
const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { friendUsername } = req.params;
  const user = await User.findOne({ username: friendUsername });
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  const friendId = user._id;

  const userId = req.user._id;

  const message = await Message.create({
    sender: userId,
    receiver: friendId,
    message: content,
  });

  let conversation = await Conversation.findOne({
    $or: [
      { participantOne: userId, participantTwo: friendId },
      { participantOne: friendId, participantTwo: userId },
    ],
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participantOne: userId,
      participantTwo: friendId,
      messages: [message],
    });
  } else {
    conversation.messages.push(message);
    await conversation.save();
  }

  return res.status(200).json(new ApiResponse(200, [], "Message sent"));
});

// ✅ Delete a message – Users can delete their own messages.
// ✅ Edit a message – Users can modify sent messages.

export {
  sendFriendReq,
  acceptFriendReq,
  withdrowReq,
  unFriend,
  banUser,
  unBanUser,
  getAllFriends,
  pendingReq,
  getAllMessages,
  sendMessage
};
//============================= Additional Features for Better UX ===============================
// ✅ Message status (sent, delivered, read) – Indicate the message state.
// ✅ Typing indicators – Show when the other user is typing.
// ✅ Read receipts – Show when a message has been seen.
// ✅ Report messages – Users can report abusive or inappropriate messages.
// ✅ Archive conversations – Users can archive chats instead of deleting them.
// ✅ Pin important messages – Users can pin messages to highlight them.
// ✅ Search messages – Allow users to search for specific messages.
// ✅ Paginated message loading – Load messages in chunks to improve performance.
// ✅ Custom chat themes – Users can personalize their chat UI.
// ✅ Custom chat nicknames – Users can set nicknames for friends.
// ✅ Scheduled messages – Users can set messages to be sent at a later time.
// ✅ Voice & Video Calling (Future scope) – Enable real-time calls between users.
// ✅ Get mutual friends – Display mutual connections between two users.
// ✅ Send multimedia messages – Allow sharing images, videos, and documents.
// ✅ Send voice messages – Enable users to send audio messages.
// ✅ React to messages – Users can like/react to messages with emojis.
