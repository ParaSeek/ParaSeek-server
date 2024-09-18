import express from 'express';
import { login, logout, register, socialAuth } from '../controllers/auth.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js'
const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',verifyJWT,logout);
authRouter.post('/social-auth',socialAuth);

export {
    authRouter
}