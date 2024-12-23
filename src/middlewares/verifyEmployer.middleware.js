import Company from "../models/company.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const verfiyEmployer = asyncHandler(async (req, res, next) => {
    // verify company exist or not
    const { companyName } = req.body;

    const company = await Company.findOne({ companyName });

    if (!company) {
        throw new ApiError(400, "Company not exist");
    }

    const userId = req.user._id;

    // verify employer able to create jobs or not
    if (!(company.employers.includes(userId) || company.companyOwner.toString() === userId.toString())) {
        throw new ApiError(400, "You are not employer of this company");
    }

    next();
});

export default verfiyEmployer;