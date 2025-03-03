import express from 'express';
import verifyJWT from "../middlewares/auth.middleware.js";
import { acceptFriendReq, banUser, getAllFriends, getAllMessages, pendingReq, sendFriendReq, sendMessage, unBanUser, unFriend, withdrowReq } from '../controllers/message.controller.js';

const messageRouter = express.Router();

messageRouter.post("/sendfriendReq",verifyJWT,sendFriendReq);
messageRouter.post("/acceptfriendReq/:senderUserId",verifyJWT,acceptFriendReq);
messageRouter.post("/withdrowReq/:receiverId",verifyJWT,withdrowReq);
messageRouter.post("/unfriend",verifyJWT,unFriend);
messageRouter.post("/ban/:userId",verifyJWT,banUser);
messageRouter.post("/unban/:userId",verifyJWT,unBanUser);
messageRouter.get("/getallfriend",verifyJWT,getAllFriends);
messageRouter.get("/pendingReq",verifyJWT,pendingReq);
messageRouter.get("/getallmessages/:friendUsername",verifyJWT,getAllMessages);
messageRouter.post("/sendMessage/:friendUsername",verifyJWT,sendMessage);

export default messageRouter;