import Company from "../models/company.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verfiyOwnerShip = asyncHandler(async (req, res, next) => {
    // verify company exist or not
    const { companyId } = req.params;

    const company = await Company.findById(companyId);

    if (!company) {
        throw new ApiError(400, "Company not exist");
    }

    const userId = req.user._id;

    // verify employer able to create jobs or not
    if (company.companyOwner.toString() !== userId.toString()) {
        throw new ApiError(400, "You are not the owner of the company");
    }

    next();
});

export default verfiyOwnerShip;
