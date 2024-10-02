import express from "express";
import verifyJWT from "../../../server/src/middlewares/auth.middleware.js";
import {
  updateAvatar,
  updatePassword,
  updateProfile,
  updateResume,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const userRouter = express.Router();

userRouter.post("/update-profile", verifyJWT, updateProfile);
userRouter.post(
  "/update-avatar",
  verifyJWT,
  upload.single("avatar"),
  updateAvatar
);
userRouter.post(
  "/update-resume",
  verifyJWT,
  upload.single("resume"),
  updateResume
);
userRouter.post("/update-password", verifyJWT, updatePassword);

export { userRouter };
