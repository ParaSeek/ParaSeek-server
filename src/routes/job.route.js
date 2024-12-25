import express from "express";
import {
  addQuestions,
  authorizeEmployer,
  drive_verify,
  getAllJobs,
  getJobsCreatedByUser,
  jobCreated,
  jobDeleted,
  jobStatusUpdate,
  jobUpdated,
  recommededJobs,
} from "../controllers/job.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import verfiyEmployer from "../middlewares/verifyEmployer.middleware.js";

const jobRouter = express.Router();

jobRouter.post("/job-created", verifyJWT, verfiyEmployer, jobCreated);
jobRouter.post("/add-questions/:jobId", verifyJWT, addQuestions);
jobRouter.patch("/job-updated/:job_id", verifyJWT, jobUpdated);
jobRouter.delete("/job-delete/:job_id", verifyJWT, jobDeleted);
jobRouter.get("/get-jobs", getAllJobs);
jobRouter.get("/get-employer-jobs/:userId", verifyJWT, getJobsCreatedByUser);
jobRouter.patch("/update-status/:job_id", verifyJWT, jobStatusUpdate);

//job router for google drive
jobRouter.get("/drive-verification", verifyJWT, authorizeEmployer); // return the drive link to login
jobRouter.get("/drive-code", verifyJWT, drive_verify); // return the drive link to login

//recommendation
jobRouter.get("/recommendations", verifyJWT, recommededJobs);

export { jobRouter };
