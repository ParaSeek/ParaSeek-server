import express from "express";
import verifyJWT from "../middlewares/auth.middleware";

const applicationRouter = express.Router();

applicationRouter.post('/apply',verifyJWT)