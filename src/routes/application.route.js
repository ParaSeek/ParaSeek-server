import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { applyForJob } from "../controllers/application.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const applicationRouter = express.Router();

applicationRouter.post(
  "/apply/:job_id",
  verifyJWT,
  upload.fields([
    {
      name: "resume",
      maxCount: 1,
    },
    {
      name: "job_questions",
      maxCount: 1,
    },
  ]),
  applyForJob
);

export { applicationRouter };
