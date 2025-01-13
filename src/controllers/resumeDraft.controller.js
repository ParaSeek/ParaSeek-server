import { ResumeDraft } from "../models/resumeDraft.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

// Controller to get the resume draft
const getResumeDraft = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    throw new ApiError(400, "Email is required to fetch the draft.");
  }

  const resumeDraft = await ResumeDraft.findOne({ email });

  if (!resumeDraft) {
    throw new ApiError(404, "No draft found for the provided email.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, resumeDraft, "Draft fetched successfully."));
});

// Controller to save or update the resume draft
const saveResumeDraft = asyncHandler(async (req, res) => {
  const {
    email,
    name,
    phone,
    address,
    gender,
    dob,
    links,
    nationality,
    professionalOverview,
    declaration,
    hobbies,
    displayDate,
  } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required to save or update the draft.");
  }

  // Validate the user
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(403, "Unauthorized request.");
  }

  // Check for existing draft
  let resumeDraft = await ResumeDraft.findOne({ email });

  if (resumeDraft) {
    // Update existing draft
    resumeDraft.name = name ?? resumeDraft.name;
    resumeDraft.phone = phone ?? resumeDraft.phone;
    resumeDraft.address = address ?? resumeDraft.address;
    resumeDraft.gender = gender ?? resumeDraft.gender;
    resumeDraft.dob = dob ?? resumeDraft.dob;
    resumeDraft.links = links ?? resumeDraft.links;
    resumeDraft.nationality = nationality ?? resumeDraft.nationality;
    resumeDraft.professionalOverview =
      professionalOverview ?? resumeDraft.professionalOverview;
    resumeDraft.declaration = declaration ?? resumeDraft.declaration;
    resumeDraft.hobbies = hobbies ?? resumeDraft.hobbies;
    resumeDraft.displayDate = displayDate ?? resumeDraft.displayDate;

    const updatedDraft = await resumeDraft.save();
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedDraft, "Draft updated successfully.")
      );
  } else {
    // Create a new draft
    resumeDraft = new ResumeDraft({
      email,
      name,
      phone,
      address,
      gender,
      dob,
      links,
      nationality,
      professionalOverview,
      declaration,
      hobbies,
      displayDate,
    });

    const savedDraft = await resumeDraft.save();
    return res
      .status(201)
      .json(new ApiResponse(201, savedDraft, "Draft saved successfully."));
  }
});

export { getResumeDraft, saveResumeDraft };
