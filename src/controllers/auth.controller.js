import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const register = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName,role } = req.body;

  if (!email || !password || !username || !firstName || !lastName || !role) {
    throw new ApiError(400, "All filed are requried");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(400, "User already exist");
  }

  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName,
    role
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong");
  }

  const createdUser = await User.findById(user._id);

  if (!createdUser) {
    throw new ApiError(500, "Something went worng");
  }

  const { refreshToken, accessToken } = generateAccessAndRefereshTokens(
    createdUser._id
  );

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }


  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id);

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged In Successfully"));
});

const logout = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const socialAuth = asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  const user = await userModel.findOne({ email });

  const options = {
    httpOnly: true,
    secure: false,
  };

  if (!user) {
    const newUser = await userModel.create({ email, name });
    const { refreshToken, accessToken } = generateAccessAndRefereshTokens(
      newUser._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, loggedInUser, "User logged In Successfully"));
  } else {
    const { refreshToken, accessToken } = generateAccessAndRefereshTokens(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, loggedInUser, "User logged In Successfully"));
  }
});

export { register, login, logout, socialAuth };
