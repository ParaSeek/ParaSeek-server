import express from "express";
import {
  activateUser,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  socialAuth,
} from "../controllers/auth.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/activate-user", activateUser);
authRouter.post("/login", login);
authRouter.post("/social-auth", socialAuth);
authRouter.post("/logout", verifyJWT, logout);
authRouter.post('/forgotPassword',forgotPassword);
authRouter.post('/resetPassword/:token',resetPassword);

export { authRouter };
