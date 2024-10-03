import express from "express";
import { createAndUpdateQualification } from "../controllers/qualification.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const qualificationRouter = express.Router();

qualificationRouter.post(
  "/create-qualification",
  verifyJWT,
  createAndUpdateQualification
);

export { qualificationRouter };
