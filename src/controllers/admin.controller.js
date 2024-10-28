// get all jobs
// get all user
// update the role of the user
// get analytics

import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Preferences } from "../models/jobPreferences.model.js";
import { Qualification } from "../models/qualification.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllUsersAdmin = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(201, users, "Geting all users"));
});

const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(201, jobs, "Getting all jobs"));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "update the role of user"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params; // Assuming you're getting user ID from route parameters

  // Check if the user exists
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  // Cascade delete: Delete all jobs posted by the user (if the user is an employer)
  if (user.role === "employer") {
    await Job.deleteMany({ postedBy: user._id });
  }

  // Cascade delete: Delete all job applications made by the user (if the user is a job seeker)
  await Application.deleteMany({ user: user._id });

  // Cascade delete: Delete associated qualification and job preferences
  if (user.qualification) {
    await Qualification.findByIdAndDelete(user.qualification);
  }

  if (user.jobPreferences) {
    await Preferences.findByIdAndDelete(user.jobPreferences);
  }

  // Finally, delete the user
  await User.findByIdAndDelete(id);
  return (
    res.status(200),
    json(200, {}, "User and associated data deleted successfully")
  );
});
export { getAllJobsAdmin, getAllUsersAdmin, updateUserRole,deleteUser };
