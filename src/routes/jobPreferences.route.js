import express from "express";
import { createOrUpdateJobPreferences } from "../controllers/jobPreferences.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
const jobPreferencesRouter = express.Router();

jobPreferencesRouter.post(
  "/createAndUpdate-jobpreferences",
  verifyJWT,
  createOrUpdateJobPreferences
);

export { jobPreferencesRouter };
