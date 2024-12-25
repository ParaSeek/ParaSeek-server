import Company from "../models/company.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const checkEmployer = async (userId, companyName) => {
    const company = await Company.findOne({ companyName });

    if (!company) {
        throw new ApiError(400, "Company not exist");
    }
    company.employers.forEach((employer) => {
        if (employer.user.toString() === userId.toString() && employer.hireProcess === "hired") {
            return true;
        }
    });
    return false;
}
const verfiyEmployer = asyncHandler(async (req, res, next) => {
    // verify company exist or not
    const { companyName } = req.body;

    const company = await Company.findOne({ companyName });

    if (!company) {
        throw new ApiError(400, "Company not exist");
    }

    const userId = req.user._id;

    // verify employer able to create jobs or not
    if (!(checkEmployer(userId, companyName) || company.companyOwner.toString() === userId.toString())) {
        throw new ApiError(400, "You are not employer of this company");
    }

    next();
});

export default verfiyEmployer;