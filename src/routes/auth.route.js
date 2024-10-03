import express from "express";
import {
  activateUser,
  login,
  logout,
  register,
  socialAuth,
} from "../controllers/auth.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/activate-user", activateUser);
authRouter.post("/login", login);
authRouter.post("/social-auth", socialAuth);
authRouter.post("/logout", verifyJWT, logout);

export { authRouter };
