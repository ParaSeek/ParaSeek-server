import asyncHandler from "express-async-handler";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import PDFDocument from "pdfkit"; // Ensure you have pdfkit installed
import { drive } from "../config/googleDrive.js"; // Adjust the import according to your config
import { oauth2Client } from "../config/oauth.js"; // Adjust the import according to your config
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Apply for a job
export const applyForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  const userId = req.user._id; // Assuming the user is authenticated
  const folderId = "YOUR_EMPLOYER_FOLDER_ID"; // Replace with actual employer folder ID

  // Validate input
  if (!jobId) {
    throw new ApiError(400, "Job Id is required");
  }

  // Check if the job exists
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(400, "Job not found");
  }

  // Check if the user has already applied for the job
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: userId,
  });

  if (existingApplication) {
    throw new ApiError(400, "You have already applied for this job");
  }

  // Create a new application
  const application = await Application.create({
    job: jobId,
    applicant: userId,
    status: "applied",
    appliedAt: Date.now(),
  });

  // Generate PDF document for the job application
  const userData = {
    name: req.user.name, // Adjust this to get user's name
    email: req.user.email, // Adjust this to get user's email
    experience: req.user.experience, // Adjust this to get user's experience
  };

  const pdfStream = generatePDF(userData);

  // Upload PDF to employer's Google Drive folder
  const fileName = `Job_Application_${application._id}.pdf`;
  await uploadToDrive(fileName, pdfStream, folderId);

  // Respond with success
  return res
    .status(201)
    .json(new ApiResponse(201, application, "Job applied successfully"));
});

// Generate PDF for user job application
const generatePDF = (userData) => {
  const doc = new PDFDocument();
  let buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdfData = Buffer.concat(buffers);
    return pdfData; // Return PDF data as a Buffer
  });

  doc.text(`Name: ${userData.name}`);
  doc.text(`Email: ${userData.email}`);
  doc.text(`Experience: ${userData.experience}`);
  doc.end();

  return buffers; // Return the PDF stream
};

// Upload PDF to employer's Google Drive folder
const uploadToDrive = async (fileName, fileStream, folderId) => {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId], // Employer's folder ID
    };

    const media = {
      mimeType: "application/pdf",
      body: fileStream,
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    console.log("File uploaded to Google Drive with ID:", file.data.id);
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw new ApiError(401, "Failed to upload PDF to Google Drive");
  }
};
