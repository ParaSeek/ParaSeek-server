import express from 'express';
import { getAllJobs, getJobsCreatedByUser, jobCreated, jobDeleted, jobStatusUpdate, jobUpdated } from '../controllers/job.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js';

const jobRouter = express.Router();

jobRouter.post("/job-created",verifyJWT,jobCreated);
jobRouter.patch("/job-updated/:job_id",verifyJWT,jobUpdated);
jobRouter.delete("/job-delete/:job_id",verifyJWT,jobDeleted);
jobRouter.get("/get-jobs",verifyJWT,getAllJobs);
jobRouter.get("/get-employer-jobs/:user_id",verifyJWT,getJobsCreatedByUser);
jobRouter.patch("/update-status/:job_id",verifyJWT,jobStatusUpdate);

export {jobRouter};