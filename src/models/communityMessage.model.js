import mongoose from "mongoose";

const communityMessageSchema = new mongoose.Schema({
    community:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Community",
        required: true,
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },
    message:{
        type:String,
        required:true,
    }
},{timestamps: true});

const CommunityMessage = mongoose.model("CommunityMessage",communityMessageSchema);
export default CommunityMessage;