import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Community from "../models/community.model.js";
import CommunityMessage from "../models/communityMessage.model.js";
import { User } from "../models/user.model.js";
// ✅ Create a community – Allow company owners to create communities.
const createCommunity = asyncHandler(async (req, res) => {

  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "pls provide Name and Description to create communitie");
  }

  const community = await Community.create({
    name,
    description,
    owner: req.user._id,
    members: [req.user._id]
  });

  await community.save();

  if (!community) {
    throw new ApiError(500, "communtity is not created yet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, community, "Community is created successfully"));
});

// ✅ Get all joined communities – Fetch all the communities a user is a member of.
const getAllCommunities = asyncHandler(async (req, res) => {
  const communities = await Community.find().populate({ path: "members", select: "firstName lastName username profilePic" });

  return res
    .status(200)
    .json(new ApiResponse(200, communities, "Get all communities"));
});

// ✅ Delete a community – Company owners should be able to delete their communities.
const deleteCommunity = asyncHandler(async (req, res) => {
  const { communityId } = req.params;

  if (!communityId) {
    throw new ApiError(
      400,
      "Pls provide the community id to delete the community"
    );
  }

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(400, "Community does not exist");
  }

  if (community.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are not authorized to delete the community");
  }

  await Community.findByIdAndDelete(communityId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Community delete successfully"));
});

// ✅ Edit community details – Allow owners to update the name, description.
const editCommunity = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const { name, description } = req.body;

  if (!communityId) {
    throw new ApiError(400, "Pls provide the community id");
  }

  const community = await Community.findById(communityId);

  community.name = name || community.name;
  community.description = description || community.description;

  await community.save();

  return res
    .status(200)
    .json(new ApiResponse(200, community, "Community update successfully"));
});

// ✅ Ban a member – Restrict a user from the community.
const ban = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { communityId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Pls provide the user id first");
  }
  if (!communityId) {
    throw new ApiError(400, "Pls provide the community id");
  }

  await Community.findByIdAndUpdate(communityId, {
    $pull: { banned: userId },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User banned successfully"));
});

// ✅ Unban a member – Revoke a ban and allow the user to rejoin.
const unBan = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { communityId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Pls provide the user id first");
  }
  if (!communityId) {
    throw new ApiError(400, "Pls provide the community id");
  }
  await Community.findByIdAndUpdate(communityId, {
    $pull: { banned: userId },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User unBanded successfully"));
});

// ✅ Join a community – Users should be able to join public communities or request to join private ones.
const joinCommunity = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) {
    throw new ApiError(400, "pls provide the username");
  }

  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userId = user._id;
  const { communityId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Pls provide the user id first");
  }

  if (!communityId) {
    throw new ApiError(400, "Pls provide the community id");
  }

  const community = await Community.findById(communityId);

  if (community.banned.includes(userId)) {
    throw new ApiError(
      400,
      "Can not join because user is banned for this community"
    );
  }

  if (community.members.includes(userId)) {
    throw new ApiError(400, "User is already part of this community");
  }

  community.members.push(userId);

  await community.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, community, "Memeber joined community successfully")
    );
});

// ✅ Leave a community – Users can leave a community anytime.
const leaveCommunity = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { communityId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Pls provide the user id first");
  }
  if (!communityId) {
    throw new ApiError(400, "Pls provide the community id");
  }

  const community = await Community.findById(communityId);

  if (!community.members.include(userId)) {
    throw new ApiError(400, "User is not a part of this community");
  }

  await Community.findByIdAndUpdate(communityId, {
    $pull: { members: userId },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, community, "Memeber left the community successfully")
    );
});


// ✅ Send messages in the community – Users can post messages in the community chat.
const sendMessage = asyncHandler(async (req, res) => {
  const { message, communityId } = req.body;

  if (!message || !communityId) {
    throw new ApiError(400, "Pls provide the message and communityId");
  }

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(400, "Community does not exist");
  }
  if (!community.members.includes(req.user._id)) {
    throw new ApiError(
      400,
      "You are not authorized to send msg in this community"
    );
  }

  const msg = await CommunityMessage.create({
    message,
    sender: req.user._id,
    community: communityId,
  });

  await msg.save();

  return res
    .status(200)
    .json(new ApiResponse(200, msg, "send message successfully"));
});

// ✅ Edit messages – Users can edit their own messages.
const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { message } = req.body;

  if (!messageId || !message) {
    throw new ApiError(400, "Pls provide both");
  }

  const msg = await CommunityMessage.findById(messageId);

  if (!msg) {
    throw new ApiError(400, "msg does not exist");
  }

  if (msg.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are authorized to edit this msg");
  }
  msg.message = message || msg.message;

  await msg.save();

  return res.status(200).json(200, msg, "msg update successfully");
});

// ✅ Delete messages – Users can delete their own messages.
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  if (!messageId) {
    throw new ApiError(400, "Pls provide messageId");
  }

  const msg = await CommunityMessage.findById(messageId);

  if (!msg) {
    throw new ApiError(400, "msg does not exist");
  }

  if (msg.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are authorized to delete this msg");
  }

  await CommunityMessage.findByIdAndDelete(messageId);

  return res.status(200).json(200, {}, "msg update successfully");  //bug here
});

// ✅ Load all messages – Fetch all messages from the community chat.
const loadCommunityMessages = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const messages = await CommunityMessage.find({ community: communityId }).populate({ path: "sender", select: "firstName lastName username profilePic", options: { sort: { updatedAt: -1 } } });
  return res.status(200).json(new ApiResponse(200, messages, "Load msg successfully"));
});


export {
  createCommunity,
  deleteCommunity,
  editCommunity,
  ban,
  unBan,
  joinCommunity,
  leaveCommunity,
  getAllCommunities,
  sendMessage,
  editMessage,
  deleteMessage,
  loadCommunityMessages,
};

//================= Extra Features ===================

// ✅ Load messages with pagination – Load messages in chunks for performance optimization.
// ✅ Search messages – Users can search for specific messages in the community.
// ✅ Mention users (@username) – Notify specific users in messages.
// ✅ React to messages – Users can like/react to messages.
// ✅ Threaded replies – Users can reply to messages in a thread format.
// ✅ Report messages – Users can report inappropriate content.
// ✅ Pin messages – Owners/moderators can pin important messages.
// ✅ Community Announcements – Owners/moderators can send announcements to all members.
// ✅ Polls & Surveys – Owners/moderators can create polls for user engagement.
// ✅ Events & Meetups – Schedule online/offline events for community members.
// ✅ Community Analytics – Owners can see insights like active users, engagement, and message activity.
// ✅ Community Guidelines & Rules – Set predefined rules for community members.
