import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

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

  if (
    !firstName &&
    !lastName &&
    !phoneNumber &&
    !email &&
    !dob &&
    !gender &&
    !street &&
    !city &&
    !state &&
    !postalCode &&
    !country
  ) {
    throw new ApiError(400, "Nothing to update");
  }
  if (!email || !firstName || !lastName) {
    throw new ApiError(400, "Flied are required");
  }

  let user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(401, "User not exist");
  }

  const dobDate = new Date(dob);

  // Validate before saving
  if (dobDate > Date.now()) {
    throw new ApiError(400, "Date of birth cannot be in the future.");
  }
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phoneNumber = phoneNumber || user.phoneNumber;
  user.email = email || user.email;
  user.dob = dobDate || user.dob;
  user.gender = gender || user.gender;
  user.addresses.street = street || user.addresses.street;
  user.addresses.city = city || user.addresses.city;
  user.addresses.state = state || user.addresses.state;
  user.addresses.postalCode = postalCode || user.addresses.postalCode;
  user.addresses.country = country || user.addresses.country;

  user = await user.save();
  const updatedUser = await User.findById(user._id).select(
    "-password -jobsPosted"
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User update profile Successfully")
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "User not exists");
  }
  let avatarLocalPath = req.file?.avatar;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar path not exist");
  }
  if (avatarLocalPath) {
    if (user.profileImg) {
      await cloudinary.uploader.destroy(
        user.avatar.split("/").pop().split(".")[0]
      );
    }
    const uploadedResponse = await uploadOnCloudinary(avatarLocalPath);
    user.avatar = uploadedResponse;
  }
  user = await user.save();

  return res
    .state(200)
    .json(new ApiResponse(200, {}, "avatar set Successfully"));
});

const updateResume = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "User not exists");
  }
  let resumeLocalPath = req.file?.resume;
  if (!resumeLocalPath) {
    throw new ApiError(400, "Avatar path not exist");
  }
  if (resumeLocalPath) {
    if (user.profileImg) {
      await cloudinary.uploader.destroy(
        user.resume.split("/").pop().split(".")[0]
      );
    }
    const uploadedResponse = await uploadOnCloudinary(resumeLocalPath);
    user.resume = uploadedResponse;
  }
  user = await user.save();

  return res
    .state(200)
    .json(new ApiResponse(200, {}, "resume set Successfully"));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Please enter old and new password");
  }

  const user = await User.findById(req.user?._id).select("+password");

  if (user?.password === undefined) {
    throw new ApiError(400, "Invaild user");
  }

  const isPasswordMatch = await user?.isPasswordCorrect(oldPassword);

  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;

  await user.save();

  res
    .status(201)
    .json(new ApiResponse(201, {}, "password update Successfully"));
});

export { updateProfile, updateAvatar, updateResume,updatePassword };
