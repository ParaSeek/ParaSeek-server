import { Qualification } from "../models/qualification.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// creating and updating the qualification
const createAndUpdateQualification = asyncHandler(async (req, res) => {
  const { education, skills, certifications, languages, experience } = req.body;

  // Custom validation
  if (!education && !skills && !certifications && !languages && !experience) {
    throw new ApiError(400, "Nothing to be added or updated.");
  }

  // Fetch the user from the database
  const user = await User.findById(req.user._id).populate("education"); // Assuming 'education' field refers to Qualification object ID

  if (!user) {
    throw new ApiError(400, "User does not exist.");
  }

  // Check if user already has a qualification object
  if (user.education) {
    // Update the existing qualification
    const qualification = await Qualification.findById(user.education);

    if (!qualification) {
      throw new ApiError(404, "Qualification not found.");
    }

    // Update the fields only if provided in the request
    qualification.education = education || qualification.education;
    qualification.skills = skills || qualification.skills;
    qualification.certifications = certifications || qualification.certifications;
    qualification.languages = languages || qualification.languages;
    qualification.experience = experience || qualification.experience;

    const updatedQualification = await qualification.save();

    if (!updatedQualification) {
      throw new ApiError(500, "Failed to update qualification.");
    }

    res.status(200).json(
      new ApiResponse(200, updatedQualification, "Qualification updated successfully.")
    );
  } else {
    // Create a new qualification if the user does not have one
    const newQualification = new Qualification({
      education,
      skills,
      certifications,
      languages,
      experience,
    });

    const savedQualification = await newQualification.save();

    if (!savedQualification) {
      throw new ApiError(500, "Something went wrong while creating qualification.");
    }

    // Link the new qualification to the user
    user.qualification = savedQualification._id;
    await user.save();

    res.status(201).json(
      new ApiResponse(201, savedQualification, "Qualification created successfully.")
    );
  }
});


export { createAndUpdateQualification };
