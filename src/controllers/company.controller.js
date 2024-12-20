import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import Company from "../models/company.model.js";
import { User } from "../models/user.model.js";
import sendMail from "../services/sendMail.js";

// Controller to create a new company
const createCompany = asyncHandler(async (req, res) => {
  const {
    companyName,
    gstNumber,
    description,
    Headquarters,
    companySize,
    industry,
    websiteLink,
    specialties,
  } = req.body;

  // Check if the company already exists
  const companyExists = await Company.findOne({ companyName, gstNumber });
  if (companyExists) {
    throw new ApiError(400, "Company already exists");
  }

  // Create a new company
  const company = await Company.create({
    companyName,
    gstNumber,
    description,
    Headquarters,
    companySize,
    industry,
    specialties,
    websiteLink,
    companyOwner: req.user._id,
  });

  if (company) {
    const user = await User.findById(req.user._id);
    user.companies.push(company._id);
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, company, "Company created successfully"));
  } else {
    throw new ApiError(400, "Invalid company data");
  }
});

// Controller to hire an employer by adding a user to the employers array
const hireEmployer = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { username } = req.body;

  // Find the company and add the employer if it exists
  const company = await Company.findById(companyId);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  const user = await User.findOne({ username: username });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (company.companyOwner.toString() === user._id.toString()) {
    throw new ApiError(400, "You cannot hire yourself");
  }

  console.log(user);

  if (user.role !== "employer") {
    throw new ApiError(404, "User is not employer");
  }
  company.employers.push({ user: user._id, hireProcess: "pending" });

  await company.save();
  const data = {
    user: { name: user.firstName + user.lastName },
    jobTitle: "Hiring recruiter",
    companyName: company.companyName,
    companyId: company._id,
  };

  await sendMail({
    email: user.email,
    subject: "Offer letter",
    template: "offer-letter.ejs",
    data,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "successfully sent the offer letter"));
});

const employerResponse = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { message } = req.body;
  const userId = req.user._id;

  const company = await Company.findById(companyId);
  if (!company) {
    throw new ApiError(404, "company not exist");
  }

  if (
    !company.employers.some(
      (employer) => employer.user.toString() === userId.toString()
    )
  ) {
    throw new ApiError(
      404,
      "You are not the one who was offered the job or you already rejected the job."
    );
  }

  if (
    message === "reject" &&
    company.employers.find(
      (employer) => employer.user.toString() === userId.toString()
    ).hireProcess === "pending"
  ) {
    await Company.updateOne(
      { _id: companyId },
      { $pull: { employers: { user: userId } } }
    );
    throw new ApiError(404, "You rejected the offer");
  } else if (message === "accept") {
    await Company.updateOne(
      { _id: companyId, "employers.user": userId },
      { $set: { "employers.$.hireProcess": "hired" } }
    );
    const user = await User.findById(userId);
    user.companies.push(companyId);
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(200, company, "Congratulations, You are hired"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, company, "You are already hired"));
});

//Controller to fire an employee
const fireEmployer = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { userId } = req.body;

  // Find the company and add the employer if it exists
  const company = await Company.findById(companyId);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const employerIndex = company.employers.findIndex(
    (employer) => String(employer.user) === String(userId)
  );
  const companiesIndex = user.companies.findIndex(
    (company) => String(company) === String(companyId)
  );

  if (employerIndex === -1) {
    throw new ApiError(404, "User is not an employer in this company");
  }

  company.employers.splice(employerIndex, 1);
  user.companies.splice(companiesIndex, 1);

  await company.save();
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Employer removed successfully"));
});
// Controller to hire an employer by adding a user to the employers array
const follow = asyncHandler(async (req, res) => {
  const { companyId } = req.body;
  // Find the company and add the employer if it exists
  const company = await Company.findById(companyId);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  if (!company.followers.includes(req.user._id)) {
    company.followers.push(req.user._id);
    await company.save();
  } else {
    company.followers.pop(req.user._id);
    await company.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, company, "Employer added successfully"));
});

// Controller to get a company's details by its ID
const getCompany = asyncHandler(async (req, res) => {
  const companyId = req.params.id;

  // Find the company by ID and populate related fields
  const company = await Company.findById(companyId)
    .populate("jobs")
    .populate("employers")
    .populate("following")
    .populate("companyOwner");

  if (company) {
    return res.status(200).json(new ApiResponse(200, company, "success"));
  } else {
    throw new ApiError(404, "Company not found");
  }
});
// Controller to get a company's details by its ID
const getCompanyCreatedByUser = asyncHandler(async (req, res) => {
  // Find the company by ID and populate related fields
  const company = await Company.find({ companyOwner: req.user._id })
    .populate("jobs")
    .populate("employers.user")
    .populate("companyOwner");

  if (company) {
    return res.status(200).json(new ApiResponse(200, company, "success"));
  } else {
    throw new ApiError(404, "Company not found");
  }
});

// Controller to get a company's details by its ID
const getAllCompany = asyncHandler(async (req, res) => {
  const companies = await Company.find();
  if (companies) {
    return res.status(200).json(new ApiResponse(200, companies, "success"));
  } else {
    throw new ApiError(404, "Companies not found");
  }
});

// Controller to update a company's information
const updateInfoCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  // Find and update the company
  const company = await Company.findById(companyId);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Update fields
  company.companyName = req.body.companyName || company.companyName;
  company.description = req.body.description || company.description;
  company.Headquarters = req.body.Headquarters || company.Headquarters;
  company.companySize = req.body.companySize || company.companySize;
  company.industry = req.body.industry || company.industry;
  company.specialties = req.body.specialties || company.specialties;
  company.overview = req.body.overview || company.overview;

  const updatedCompany = await company.save();
  return res
    .status(200)
    .json(new ApiResponse(200, updatedCompany, "Company updated successfully"));
});

const deleteCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  // Find and delete the company
  const company = await Company.findById(companyId);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  await User.updateMany(
    { companies: companyId },
    { $pull: { companies: companyId } }
  );

  await company.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Company Deleted successfully"));
});

const uploadLogo = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }
  const companyLogoLocalPath = req.file?.path;

  // Check if the avatar file is provided
  if (!companyLogoLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // If the user already has an avatar, delete the previous one from Cloudinary
  if (company.companyLogo && company.companyLogo.startsWith("https")) {
    const publicId = company.companyLogo.split("/").pop().split(".")[0]; // Extract Cloudinary public ID
    try {
      await cloudinary.uploader.destroy(publicId); // Delete old avatar
      const uploadedCompanyLogo = await uploadOnCloudinary(
        companyLogoLocalPath
      );
      await Company.findByIdAndUpdate(
        companyId,
        {
          $set: {
            companyLogo: uploadedCompanyLogo,
          },
        },
        { new: true }
      );
    } catch (error) {
      throw new ApiError(500, "Error deleting old company logo ");
    }
  } else {
    const uploadedCompanyLogo = await uploadOnCloudinary(companyLogoLocalPath);
    if (!uploadedCompanyLogo) {
      throw new ApiError(
        500,
        "Internal server error while uploading companyLogo"
      );
    }
    await Company.findByIdAndUpdate(
      companyId,
      {
        $set: {
          companyLogo: uploadedCompanyLogo,
        },
      },
      { new: true }
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, company, "companyLogo updated successfully"));
});

export {
  uploadLogo,
  updateInfoCompany,
  getCompany,
  hireEmployer,
  employerResponse,
  fireEmployer,
  createCompany,
  getAllCompany,
  getCompanyCreatedByUser,
  follow,
  deleteCompany,
};
