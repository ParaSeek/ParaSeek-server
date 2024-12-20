import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import verfiyOwnerShip from "../middlewares/verifyOwnerShip.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createCompany,
  follow,
  getAllCompany,
  getCompany,
  getCompanyCreatedByUser,
  hireEmployer,
  updateInfoCompany,
  uploadLogo,
  deleteCompany
} from "../controllers/company.controller.js";

const companyRouter = express.Router();

companyRouter.post("/create-company", verifyJWT, createCompany);
companyRouter.patch(
  "/hire-employers",
  verifyJWT,
  verfiyOwnerShip,
  hireEmployer
);
companyRouter.get("/get-company", getCompany);
companyRouter.get("/get-all-company", getAllCompany);
companyRouter.post("/follow", verifyJWT, follow);
companyRouter.get(
  "/get-company-created-by-user",
  verifyJWT,
  getCompanyCreatedByUser
);
companyRouter.patch(
  "/update-company-info/:companyId",
  verifyJWT,
  verfiyOwnerShip,
  updateInfoCompany
);
companyRouter.post(
  "/upload-logo/:companyId",
  verifyJWT,
  verfiyOwnerShip,
  upload.single("companyLogo"),
  uploadLogo
);
companyRouter.delete(
  "/delete/:companyId",
  verifyJWT,
  verfiyOwnerShip,
  deleteCompany
);

export default companyRouter;
