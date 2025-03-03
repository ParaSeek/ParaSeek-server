import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participantOne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participantTwo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
