import { asyncHandler } from "../utils/asyncHandler.js";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { User } from "../models/user.model.js";

const applyForJob = asyncHandler(async (req, res) => {
  const { job_id } = req.params;
  const job = await Job.findById(job_id);
  if (!job) throw new ApiError(404, "Job not found");

  const userId = job.postedBy;
  if (userId.toString() === req.user._id.toString())
    throw new ApiError(400, "You cannot apply for your own job");
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const { tokens } = user;
  const { username, _id } = req.user;

  if (!job_id) throw new ApiError(400, "Job ID is required");

  const { googleDriveFolderId } = job;
  if (!googleDriveFolderId)
    throw new ApiError(500, "Google Drive folder ID is missing for this job");

  const resumePath = req.files?.resume[0]?.path;
  // const job_questionsPath = req.files.job_questions[0].path;

  if (!fs.existsSync(resumePath))
    throw new ApiError(400, "Resume file not found");

  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  oauth2Client.setCredentials(tokens);

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const existingApplication = await Application.findOne({
      job: job_id,
      applicant: _id,
    });
    if (existingApplication)
      throw new ApiError(400, "You have already applied for this job");

    // Create a folder for this applicant's files
    const folderMetadata = {
      name: username,
      mimeType: "application/vnd.google-apps.folder",
      parents: [googleDriveFolderId],
    };

    const {
      data: { id: applicantFolderId },
    } = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });

    // Upload Resume
    const resumeMetadata = { name: "Resume.pdf", parents: [applicantFolderId] };
    const resumeMedia = {
      mimeType: "application/pdf",
      body: fs.createReadStream(resumePath),
    };
    await drive.files.create({
      resource: resumeMetadata,
      media: resumeMedia,
      fields: "id",
    });

    // Create an application record
    await Application.create({
      job: job_id,
      applicant: _id,
      status: "applied",
      appliedAt: Date.now(),
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          {},
          "Resume and job questions uploaded successfully"
        )
      );
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Failed to upload files to Google Drive");
  } finally {
    fs.unlinkSync(resumePath);
    // fs.unlinkSync(job_questionsPath);
  }
});

const getApplicantes = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    throw new ApiError(400, "job id undefined");
  }
  const applicants = await Application.find({ job: jobId }).populate(
    "applicant"
  );

  if (!applicants || applicants.length === 0) {
    throw new ApiError(404, "No applicants found for this job.");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        applicants,
        "Resume and job questions uploaded successfully"
      )
    );
});

const getAllAppliedJobs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(400, "userId id undefined");
  }
  const appliedJobs = await Application.find({ applicant: userId }).populate(
    "job"
  );
  if (!appliedJobs || appliedJobs.length === 0) {
    throw new ApiError(400, "You not applied yet");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        applicants,
        "Resume and job questions uploaded successfully"
      )
    );
});
export { applyForJob, getApplicantes,getAllAppliedJobs };
