import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadOnCloudinary } from "../services/cloudinary.js";
// updating the profile
const updateProfile = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    dob,
    gender,
    street,
    city,
    state,
    postalCode,
    country,
  } = req.body;

  // Check if any of the required fields are missing
  if (
    !firstName ||
    !lastName ||
    !phoneNumber ||
    !email ||
    !dob ||
    !gender ||
    !street ||
    !city ||
    !state ||
    !postalCode ||
    !country
  ) {
    throw new ApiError(400, "No fields provided to update.");
  }

  let user = await User.findById(req.user._id);

  // Check if the user exists
  if (!user) {
    throw new ApiError(401, "User does not exist.");
  }

  // If date of birth is provided, validate it
  if (dob) {
    const dobDate = new Date(dob);
    if (dobDate > Date.now()) {
      throw new ApiError(400, "Date of birth cannot be in the future.");
    }
    user.dob = dobDate;
  }

  // Update the provided fields (only if they exist in req.body)
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (email) user.email = email;
  if (gender) user.gender = gender;

  if (street || city || state || postalCode || country) {
    user.location = {
      street: street || user.addresses.street,
      city: city || user.addresses.city,
      state: state || user.addresses.state,
      postalCode: postalCode || user.addresses.postalCode,
      country: country || user.addresses.country,
    };
  }

  // Save the updated user data
  user = await user.save();

  // Fetch updated user details without sensitive fields
  const updatedUser = await User.findById(user._id).select(
    "-password -jobsPosted -verifyCode -verifyCodeExpiry"
  );

  // Send a success response
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User profile updated successfully.")
    );
});

// updating the avatar here
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  // Check if the avatar file is provided
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Find the user by their ID
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // If the user already has an avatar, delete the previous one from Cloudinary
  if (user.profilePic && user.profilePic.startsWith("https")) {
    const publicId = user.profilePic.split("/").pop().split(".")[0]; // Extract Cloudinary public ID
    try {
      await cloudinary.uploader.destroy(publicId); // Delete old avatar
      const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
      await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            profilePic: uploadedAvatar,
          },
        },
        { new: true }
      ).select("-password");
    } catch (error) {
      throw new ApiError(500, "Error deleting old avatar");
    }
  } else {
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          profilePic: uploadedAvatar,
        },
      },
      { new: true }
    ).select("-password");
    console.log("helloe");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Avatar updated successfully"));
});

// Updating the resume here
const updateResume = asyncHandler(async (req, res) => {
  const resumeLocalPath = req.file?.path;

  // Check if the avatar file is provided
  if (!resumeLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Find the user by their ID
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // If the user already has an avatar, delete the previous one from Cloudinary
  if (user.resume && user.resume.startsWith("https")) {
    const publicId = user.resume.split("/").pop().split(".")[0]; // Extract Cloudinary public ID
    try {
      await cloudinary.uploader.destroy(publicId); // Delete old avatar
      const uploadedResume = await uploadOnCloudinary(resumeLocalPath);
      await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            resume: uploadedResume,
          },
        },
        { new: true }
      ).select("-password");
    } catch (error) {
      throw new ApiError(500, "Error deleting old avatar");
    }
  } else {
    const uploadedResume = await uploadOnCloudinary(resumeLocalPath);
    
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          resume: uploadedResume,
        },
      },
      { new: true }
    ).select("-password");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Resume updated successfully"));
});

// Updating the password here
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Ensure both old and new passwords are provided
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Please provide both old and new passwords.");
  }

  // Fetch the user by ID and include the password field
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(400, "Invalid user.");
  }

  // Check if the old password matches the current one
  const isPasswordMatch = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid old password.");
  }

  // Update the password to the new one
  user.password = newPassword;

  // Save the updated user details
  await user.save();

  // Respond with a success message
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully."));
});

// Get the all data of the user
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -verifyCode -verifyCodeExpiry -__v"
  ); // Exclude unnecessary fields

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Validate user role and modify the response accordingly
  let responseData;
  console.log("keunal");

  if (user.role === "job_seeker") {
    // Job Seeker: don't include jobsPosted
    responseData = await User.findById(req.user._id)
      .select("-password -verifyCode -verifyCodeExpiry -__v")
      .populate("education", "-__v") // Populate education for job seekers
      .populate("jobPreferences", "-__v");
  } else if (user.role === "employer") {
    // Employer: don't include applications or education
    responseData = await User.findById(req.user._id)
      .select("-password -verifyCode -verifyCodeExpiry -__v")
      .populate("jobsPosted", "-__v"); // Populate jobsPosted for employers
  } else {
    throw new ApiError(400, "Invalid user role");
  }

  res
    .status(200)
    .json(new ApiResponse(200, responseData, "User data fetched successfully"));
});

export { updateProfile, updateUserAvatar, updateResume, updatePassword, getMe };
