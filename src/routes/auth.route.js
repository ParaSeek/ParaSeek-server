import express from 'express';
import { activateUser, getData, login, logout, register, socialAuth } from '../controllers/auth.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js'
const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/activate-user',activateUser);
authRouter.post('/login',login);
authRouter.post('/logout',verifyJWT,logout);
authRouter.post('/social-auth',socialAuth);
authRouter.get('/me',verifyJWT,getData);

export {
    authRouter
}