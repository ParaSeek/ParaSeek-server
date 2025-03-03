import mongoose from "mongoose";

const friendReqSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiver:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
},{timestamps:true});

const FriendReq = mongoose.model("FriendReq",friendReqSchema);
export default FriendReq;
