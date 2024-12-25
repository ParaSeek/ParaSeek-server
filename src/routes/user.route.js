import express from "express";
import {
  getMe,
  progressBar,
  updatePassword,
  updateProfile,
  updateResume,
  updateUserAvatar,
} from "../controllers/user.controller.js";

import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const userRouter = express.Router();

userRouter.get("/me", verifyJWT, getMe);
userRouter.get("/progress-bar", verifyJWT, progressBar);
userRouter.post("/update-profile", verifyJWT, updateProfile);
userRouter.post("/update-password", verifyJWT, updatePassword);
userRouter.post(
  "/update-avatar",
  verifyJWT,
  upload.single("profilePic"),
  updateUserAvatar
);
userRouter.post(
  "/update-resume",
  verifyJWT,
  upload.single("resume"),
  updateResume
);

export { userRouter };
