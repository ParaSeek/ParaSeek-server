import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { ban, createCommunity, deleteCommunity, editCommunity, getAllCommunities, joinCommunity, leaveCommunity, sendMessage, loadCommunityMessages, unBan } from "../controllers/community.controller.js";

const communityRouter = express.Router();

communityRouter.post("/create-community", verifyJWT, createCommunity);
communityRouter.delete("/delete-community/:communityId", verifyJWT, deleteCommunity);
communityRouter.post("/edit-community/:communityId", verifyJWT, editCommunity);
communityRouter.post("/ban/:communityId", verifyJWT, ban);
communityRouter.post("/unBan/:communityId", verifyJWT, unBan);
communityRouter.post("/join-community/:communityId", verifyJWT, joinCommunity);
communityRouter.post("/leave-community/:communityId", verifyJWT, leaveCommunity);
communityRouter.get("/get-all-communities", verifyJWT, getAllCommunities);
communityRouter.post("/sendMessage", verifyJWT, sendMessage);
communityRouter.get("/load-all-community-messages/:communityId", verifyJWT, loadCommunityMessages);

export default communityRouter;