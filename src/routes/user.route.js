import express from "express";
import verifyJWT from "../../../server/src/middlewares/auth.middleware.js";
import { updateProfile } from "../controllers/user.controller.js";
const userRouter = express.Router();

userRouter.post("/update-profile", verifyJWT, updateProfile);

export { userRouter };
