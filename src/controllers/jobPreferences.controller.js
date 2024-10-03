import { Preferences } from "../models/jobPreferences.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createOrUpdateJobPreferences = asyncHandler(async (req, res) => {
  const { jobTitles, jobTypes, workSchedule, minimumBasePay, remote } =
    req.body;

  // Custom validation
  if (!jobTitles && !jobTypes && !workSchedule && !minimumBasePay && !remote) {
    throw new ApiError(400, "Nothing to be added or updated.");
  }

  // Fetch the user from the database
  const user = await User.findById(req.user._id).populate("jobPreferences"); // Assuming 'jobPreferences' field refers to Preferences object ID

  if (!user) {
    throw new ApiError(400, "User does not exist.");
  }

  // Check if user already has job preferences
  if (user.jobPreferences) {
    // Update existing job preferences
    const preferences = await Preferences.findById(user.jobPreferences);

    if (!preferences) {
      throw new ApiError(404, "Job preferences not found.");
    }

    // Update the fields only if provided in the request
    preferences.jobTitles = jobTitles || preferences.jobTitles;
    preferences.jobTypes = jobTypes || preferences.jobTypes;
    preferences.workSchedule = workSchedule || preferences.workSchedule;
    preferences.minimumBasePay = minimumBasePay || preferences.minimumBasePay;
    preferences.remote = remote || preferences.remote;

    const updatedPreferences = await preferences.save();

    if (!updatedPreferences) {
      throw new ApiError(500, "Failed to update job preferences.");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPreferences,
          "Job preferences updated successfully."
        )
      );
  } else {
    // Create new job preferences if the user does not have any
    const newPreferences = new Preferences({
      jobTitles,
      jobTypes,
      workSchedule,
      minimumBasePay,
      remote,
    });

    const savedPreferences = await newPreferences.save();

    if (!savedPreferences) {
      throw new ApiError(
        500,
        "Something went wrong while creating job preferences."
      );
    }

    // Link the new preferences to the user
    user.jobPreferences = savedPreferences._id;
    await user.save();

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          savedPreferences,
          "Job preferences created successfully."
        )
      );
  }
});

export { createOrUpdateJobPreferences };
