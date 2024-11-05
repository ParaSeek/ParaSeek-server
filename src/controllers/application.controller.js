import { asyncHandler } from "../utils/asyncHandler.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { google } from "googleapis";
import PDFDocument from "pdfkit"; // Ensure you have pdfkit installed
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import { fileURLToPath } from "url";

const applyForJob = asyncHandler(async (req, res) => {
  const { job_id } = req.params; // Get the job ID from the request parameters
  const user = req.user; // Get the logged-in user
  const { resume } = user; // Assuming user has a resume URL stored from Cloudinary

  // Basic validation to ensure job ID and resume URL are present
  if (!job_id || !resume) {
    throw new ApiError(400, "Job ID and resume URL are required");
  }

  // Find the job by ID
  const job = await Job.findById(job_id);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const googleDriveFolderId = job.googleDriveFolderId; // Get the Google Drive folder ID from the job
  if (!googleDriveFolderId) {
    throw new ApiError(500, "Google Drive folder ID is missing for this job");
  }

  // Get user's email and set the file name as their email username
  const emailUsername = user.email.split("@")[0];
  const fileName = `${emailUsername}_resume.pdf`; // Example: john_resume.pdf

  // Create a new OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  // Set the credentials using the user's stored tokens
  oauth2Client.setCredentials(user.tokens);

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    // Create a file in Google Drive folder using resume URL from Cloudinary
    const fileMetadata = {
      name: fileName, // Use user's email username as the file name
      parents: [googleDriveFolderId], // Save file in the job's Google Drive folder
    };

    const media = {
      mimeType: "application/pdf",
      body: request({ url: resume, encoding: null }), // Stream the resume from Cloudinary
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id",
    });

    // Check if the user has already applied for the job
    const existingApplication = await Application.findOne({
      job: job_id,
      applicant: user._id,
    });

    if (existingApplication) {
      throw new ApiError(400, "You have already applied for this job");
    }

    // Create a new application
    const application = await Application.create({
      job: job_id,
      applicant: user._id,
      status: "applied",
      appliedAt: Date.now(),
    });

    // Respond with success message and file ID
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { fileId: file.data.id },
          "Resume uploaded successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Failed to upload resume to Google Drive");
  }
});

export { applyForJob };

// // Get the current directory
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Apply for a job
// export const applyForJob = asyncHandler(async (req, res) => {
//   const { jobId } = req.body;
//   const userId = req.user._id;
//   // const folderId = "YOUR_EMPLOYER_FOLDER_ID"; // Replace with actual employer folder ID

//   // Validate input
//   if (!jobId) {
//     throw new ApiError(400, "Job Id is required");
//   }

//   // Check if the job exists
//   const job = await Job.findById(jobId);
//   if (!job) {
//     throw new ApiError(400, "Job not found");
//   }

//   const folderId = job.googleDriveFolderId;
//   // Check if the user has already applied for the job
//   const existingApplication = await Application.findOne({
//     job: jobId,
//     applicant: userId,
//   });

//   if (existingApplication) {
//     throw new ApiError(400, "You have already applied for this job");
//   }

//   // Create a new application
//   const application = await Application.create({
//     job: jobId,
//     applicant: userId,
//     status: "applied",
//     appliedAt: Date.now(),
//   });

//   // Generate PDF document for the job application
//   const userData = {
//     name: req.user.name, // Adjust this to get user's name
//     email: req.user.email, // Adjust this to get user's email
//     experience: req.user.experience, // Adjust this to get user's experience
//   };
//   const pdfStream = await generatePDF(userData);

//   // Upload PDF to employer's Google Drive folder
//   const fileName = `Job_Application_${application._id}.pdf`;
//   await uploadToDrive(fileName, pdfStream, folderId, req);

//   // Respond with success
//   return res
//     .status(201)
//     .json(new ApiResponse(201, application, "Job applied successfully"));
// });

// const generatePDF = async (userData) => {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument();
//     let buffers = [];

//     // Capture the PDF data in the buffers array
//     doc.on("data", buffers.push.bind(buffers));
//     doc.on("end", () => {
//       const pdfData = Buffer.concat(buffers);
//       resolve(pdfData); // Resolve the promise with the PDF data
//     });

//     doc.on("error", (error) => {
//       reject(error); // Reject the promise in case of an error
//     });

//     // Add user data to the PDF
//     doc.text(`Name: ${userData.name}`);
//     doc.text(`Email: ${userData.email}`);
//     doc.text(`Experience: ${userData.experience}`);
//     doc.end(); // Finalize the PDF
//   });
// };

// // Upload PDF to employer's Google Drive folder
// const uploadToDrive = async (fileName, pdfBuffer, folderId, req) => {
//   try {
//     const tokens = req.user.tokens; // Get user's Google tokens
//     if (!tokens) {
//       throw new Error("User not authenticated with Google");
//     }

//     // Create a new OAuth2 client
//     const oauth2Client = new google.auth.OAuth2(
//       process.env.CLIENT_ID,
//       process.env.CLIENT_SECRET,
//       process.env.REDIRECT_URI
//     );

//     // Set the credentials using the stored tokens
//     oauth2Client.setCredentials(tokens);
//     const drive = google.drive({ version: "v3", auth: oauth2Client });

//     // Create a temporary file to store the PDF
//     const tempFilePath = path.join(__dirname, "temp", `${fileName}.pdf`);
//     await fsExtra.outputFile(tempFilePath, pdfBuffer); // Write PDF buffer to a temporary file

//     const fileMetadata = {
//       name: fileName,
//       parents: [folderId], // Employer's Google Drive folder ID
//     };

//     const media = {
//       mimeType: "application/pdf",
//       body: fs.createReadStream(tempFilePath), // Use the path to the temporary file
//     };

//     const file = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: "id",
//     });

//     console.log("File uploaded to Google Drive with ID:", file.data.id);

//     // Clean up: remove the temporary file
//     await fsExtra.remove(tempFilePath);
//   } catch (error) {
//     console.error("Error uploading file to Google Drive:", error);
//     throw new Error("Failed to upload PDF to Google Drive");
//   }
// };
