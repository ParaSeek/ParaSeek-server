import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const updateProfile = asyncHandler(async (req, res) => {
  // console.log(req);
  const {
    firstName,
    lastName,
    email,
    dob,
    gender,
    street,
    city,
    state,
    postalCode,
    country,
    experience,
    industries,
    jobRoles,
    preferredLocation,
  } = req.body;
//   console.log("Kunksjfkj");
  if (
    !firstName &&
    !lastName &&
    !email &&
    !dob &&
    !gender &&
    !experience &&
    !industries &&
    !jobRoles &&
    !preferredLocation &&
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
//   console.log(req);
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.email = email || user.email;
  user.dob = dobDate || user.dob;
  user.gender = gender || user.gender;
  user.experience = experience || user.experience;
  user.jobPreferences.industries = industries || user.jobPreferences.industries;
  user.jobPreferences.jobRoles = jobRoles || user.jobPreferences.jobRoles;
  user.jobPreferences.preferredLocation =
    preferredLocation || user.jobPreferences.preferredLocation;
  user.addresses.street = street || user.addresses.street;
  user.addresses.city = city || user.addresses.city;
  user.addresses.state = state || user.addresses.state;
  user.addresses.postalCode = postalCode || user.addresses.postalCode;
  user.addresses.country = country || user.addresses.country;
  user.experience = experience || user.experience;

  user = await user.save();
//   console.log("Kunal KUmar");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User update profile Successfully"));
});

export { updateProfile };
