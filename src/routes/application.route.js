import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { applyForJob } from "../controllers/application.controller.js";

const applicationRouter = express.Router();

applicationRouter.post("/apply", verifyJWT, applyForJob);

export { applicationRouter };
