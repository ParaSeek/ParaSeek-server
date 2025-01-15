import { Job, JobQuestion } from "../models/job.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { google } from "googleapis";
import { User } from "../models/user.model.js";
import Company from "../models/company.model.js";


// OAuth2 Client Initialization
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Generate Google Auth URL
const getAuthUrl = () =>
  oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });

//2. Employer Authorization Controller
const authorizeEmployer = asyncHandler(async (req, res) => {
  const authUrl = getAuthUrl();
  return res
    .status(201)
    .json(
      new ApiResponse(201, authUrl + "&prompt=consent", "Redirect URL created")
    );
});

//1. Google Drive Authorization Callback
const drive_verify = asyncHandler(async (req, res) => {
  const { code } = req.query;

  const { tokens } = await oauth2Client.getToken(code); // Exchange code for tokens
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { tokens } },
    { new: true }
  );

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Authorization successful"));
});

//3. Job Creation Controller
const jobCreated = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    companyName,
    location,
    employmentType,
    remote = false,
    salaryRange,
    experienceLevel,
    jobType,
    skills,
    applicationDeadline,
    contactEmail,
    benefits,
    workHours,
    requiredEducation,
    requiredLanguages,
    numberOfOpenings,
    applicationLink,
    applicationInstructions,
  } = req.body;
  const user = await User.findById(req.user._id);
  if (user.role === "job_seeker") {
    throw new ApiError(400, "You are not authorized to create a job");
  }
  const company = await Company.findOne({ companyName: companyName });

  if (!company) {
    throw new ApiError(404, "Company not found");
  }
  // Validate Required Fields
  if (
    !title ||
    !description ||
    !companyName ||
    !location ||
    !employmentType ||
    !jobType ||
    !skills ||
    !applicationDeadline ||
    !contactEmail
  ) {
    throw new ApiError(400, "Please fill in all the required fields");
  }

  // Validate Email Format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contactEmail)) {
    throw new ApiError(400, "Invalid email format");
  }

  // Retrieve User's Google Drive Tokens
  const tokens = req.user.tokens;
  if (!tokens) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "User not authenticated with Google"));
  }

  // Initialize OAuth2 Client
  oauth2Client.setCredentials(tokens);
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  let googleDriveFolderId;

  try {
    // Create a new folder in Google Drive
    const folderMetadata = {
      name: title, // Job title as folder name
      mimeType: "application/vnd.google-apps.folder",
      parents: ["root"], // Optional: Specify parent folder
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });

    googleDriveFolderId = folder.data.id;
  } catch (error) {
    throw new ApiError(500, "Failed to create Google Drive folder");
  }

  // Create Job Entry in Database
  const job = new Job({
    title,
    description,
    companyName,
    location,
    employmentType,
    remote,
    salaryRange,
    experienceLevel,
    jobType,
    skills,
    postedBy: req.user._id,
    applicationDeadline,
    googleDriveFolderId, // Save Drive folder ID
    contactEmail,
    benefits,
    workHours,
    requiredEducation,
    requiredLanguages,
    numberOfOpenings,
    applicationLink,
    applicationInstructions,
  });

  // Save Job Entry and Respond
  const createdJob = await job.save();
  company.jobs.push(createdJob._id);
  await company.save();

  return res
    .status(201)
    .json(new ApiResponse(201, createdJob, "Job posted successfully"));
});

const addQuestions = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, "Please provide a valid array of questions");
  }

  const job = await Job.findById(jobId);

  if (job.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "You are not the owner of the job");
  }
  let jobQuestionDoc = await JobQuestion.findOne(jobId);

  if (!jobQuestionDoc) {
    jobQuestionDoc = new JobQuestion({
      jobId,
      questions: [],
    });
  }

  questions.forEach((question) => {
    jobQuestionDoc.questions.push(question);
  });

  await jobQuestionDoc.save();

  return res
    .status(200)
    .json(new ApiResponse(200, jobQuestionDoc, "Questions added successfully"));
});

// Job update controller
const jobUpdated = asyncHandler(async (req, res) => {
  const { job_id } = req.params; // Extract job ID from URL params

  // Destructure the request body to get the updated fields
  const {
    title,
    description,
    companyName,
    location,
    employmentType,
    remote,
    salaryRange,
    experienceLevel,
    jobType,
    skills,
    postedBy,
    postedDate,
    applicationDeadline,
    isActive,
    requiredEducation,
    requiredLanguages,
    numberOfOpenings,
    applicationLink,
    contactEmail,
    applicationInstructions,
    benefits,
    workHours,
  } = req.body;

  // Find the job by ID
  const job = await Job.findById(job_id);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not exist");
  }

  if (user.role !== "employer") {
    throw new ApiError(404, "You are not authorized to update the job");
  }

  if (user.id.toString() !== job.postedBy.toString()) {
    throw new ApiError(404, "You are not authorized to update it");
  }
  // Update only provided fields (partial update)
  job.title = title || job.title;
  job.description = description || job.description;
  job.companyName = companyName || job.companyName;
  job.location = location || job.location;
  job.employmentType = employmentType || job.employmentType;
  job.remote = typeof remote !== "undefined" ? remote : job.remote; // Handle boolean values
  job.salaryRange = salaryRange || job.salaryRange;
  job.experienceLevel = experienceLevel || job.experienceLevel;
  job.jobType = jobType || job.jobType;
  job.skills = skills || job.skills;
  job.postedBy = postedBy || job.postedBy;
  job.postedDate = postedDate || job.postedDate;
  job.applicationDeadline = applicationDeadline || job.applicationDeadline;
  job.isActive = typeof isActive !== "undefined" ? isActive : job.isActive; // Handle boolean values
  job.requiredEducation = requiredEducation || job.requiredEducation;
  job.requiredLanguages = requiredLanguages || job.requiredLanguages;
  job.numberOfOpenings = numberOfOpenings || job.numberOfOpenings;
  job.applicationLink = applicationLink || job.applicationLink;
  job.contactEmail = contactEmail || job.contactEmail;
  job.applicationInstructions =
    applicationInstructions || job.applicationInstructions;
  job.benefits = benefits || job.benefits;
  job.workHours = workHours || job.workHours;

  // Save the updated job to the database
  const updatedJob = await job.save();

  // Send the updated job as a response
  return res
    .status(200)
    .json(new ApiResponse(200, updatedJob, "job updated successfully"));
});

// Job deletion controller
const jobDeleted = asyncHandler(async (req, res) => {
  const { job_id } = req.params; // Extract job ID from URL params

  if (!job_id) {
    throw new ApiError(400, "job id not provided");
  }
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not exist");
  }

  if (user.role !== "employer") {
    throw new ApiError(404, "You are not authorized to delete the job");
  }

  // if (user.id.toString() !== job.postedBy.toString()) {
  //   throw new ApiError(404, "You are not authorized to deleted it");
  // }

  // Find the job by ID
  const job = await Job.findByIdAndDelete(job_id);
  const company = await Company.findOne({ companyName: job.companyName });
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  company.jobs = company.jobs.filter((job) => job.toString() !== job_id);
  company.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Job successfully deleted"));
});

// Get all jobs controller
const getAllJobs = asyncHandler(async (req, res) => {
  // Extract query parameters for filtering, sorting, and pagination
  const {
    keyword,
    location,
    jobType,
    employmentType,
    page = 1,
    limit = 10,
    sortBy = "postedDate",
    order = "desc",
  } = req.query;

  // Initialize a query object for filters
  let query = {};

  // Add filters based on query parameters
  if (keyword) {
    query.title = { $regex: keyword, $options: "i" }; // Case-insensitive search on title
  }
  if (location) {
    query.location = { $regex: location, $options: "i" }; // Case-insensitive search on location
  }
  if (jobType) {
    query.jobType = jobType;
  }
  if (employmentType) {
    query.employmentType = employmentType;
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Sort order
  const sortOrder = order === "asc" ? 1 : -1;

  // Retrieve jobs from the database with filters, pagination, and sorting
  const jobs = await Job.find(query)
    .sort({ [sortBy]: sortOrder }) // Sorting
    .skip(skip) // Pagination: skip the first (page-1) * limit items
    .limit(Number(limit)); // Limit the number of jobs returned

  // Return the jobs and total job count
  return res.status(200).json(new ApiResponse(200, jobs, "get all jobs here"));
});

// Get all jobs created by a specific user
const getJobsCreatedByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const {
    keyword,
    location,
    jobType,
    employmentType,
    page = 1,
    limit = 10,
    sortBy = "postedDate",
    order = "desc",
  } = req.query;

  // Initialize query
  let query = { postedBy: userId };

  // Add filters
  if (keyword) {
    query.title = { $regex: keyword, $options: "i" };
  }
  if (location) {
    query["location.city"] = { $regex: location, $options: "i" }; // Adjusted for nested location object
  }
  if (jobType) {
    query.jobType = jobType;
  }
  if (employmentType) {
    query.employmentType = employmentType;
  }

  // Pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === "asc" ? 1 : -1;

  // Fetch jobs
  const jobs = await Job.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(Number(limit));


  if (!jobs.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, [], "No jobs found for this user."));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, jobs, "Jobs created by user retrieved successfully")
    );
});

//Update the status
const jobStatusUpdate = asyncHandler(async (req, res) => {
  const { job_id } = req.params; // Extract job ID from URL params

  // Find the job by ID
  const job = await Job.findById({ job_id });

  if (!job) {
    throw new ApiError(400, "Job not found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not exist");
  }

  if (user.role !== "employer") {
    throw new ApiError(404, "You are not authorized to update the status");
  }

  if (user.id.toString() !== job.postedBy.toString()) {
    throw new ApiError(404, "You are not authorized to update it");
  }

  // Update the isActive status
  if (job.isActive === false) {
    job.isActive = true;
  } else {
    job.isActive = false;
  }

  // Save the updated job to the database
  const updatedJob = await job.save();

  // Send the updated job as a response
  return res
    .status(200)
    .json(new ApiResponse(200, updatedJob, "update the statue of the job"));
});

const recommededJobs = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .populate("jobPreferences")
    .populate("qualification");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const jobs = await Job.find({ isActive: true });

  if (!jobs || jobs.length === 0) {
    throw new ApiError(404, "No jobs available for recommendation");
  }

  const { jobPreferences, qualification } = user;

  const userSkills = qualification?.skills || [];
  const userJobTitles = jobPreferences?.jobTitles || [];
  const userJobTypes = jobPreferences?.jobTypes || [];
  const userRemotePreference = jobPreferences?.remote || false;

  const recommendedJobs = jobs.map((job) => {
    const skillMatchCount = job.skills.filter((skill) =>
      userSkills.includes(skill)
    ).length;
    const jobTypeMatch = userJobTypes.includes(job.jobType) ? 1 : 0;
    const remotePreferenceMatch =
      userRemotePreference === job.remote ? 1 : 0;

    // Calculate a weighted score based on matching criteria
    const score =
      skillMatchCount * 2 + // Weight skills more heavily
      jobTypeMatch * 1.5 + // Moderate weight for job type
      remotePreferenceMatch * 1; // Least weight for remote preference

    return { job, score };
  });

  recommendedJobs.sort((a, b) => b.score - a.score);

  return res.status(200).json(
    new ApiResponse(
      200,
      recommendedJobs,
      "Recommended jobs fetched successfully"
    )
  );
});

export {
  jobCreated,
  jobUpdated,
  jobDeleted,
  getAllJobs,
  getJobsCreatedByUser,
  jobStatusUpdate,
  authorizeEmployer,
  drive_verify,
  addQuestions,
  recommededJobs
};
