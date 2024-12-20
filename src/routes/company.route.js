import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import verfiyOwnerShip from "../middlewares/verifyOwnerShip.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createCompany,
  follow,
  getAllCompany,
  getCompany,
  hireEmployer,
  updateInfoCompany,
  uploadLogo,
  deleteCompany,
  employerResponse,
  fireEmployer,
  getMyCompany,
} from "../controllers/company.controller.js";

const companyRouter = express.Router();

companyRouter.post("/create-company", verifyJWT, createCompany);
companyRouter.post("/response/:companyId", verifyJWT, employerResponse);
companyRouter.patch(
  "/hire-employers/:companyId",
  verifyJWT,
  verfiyOwnerShip,
  hireEmployer
);
companyRouter.post(
  "/fire-employers/:companyId",
  verifyJWT,
  verfiyOwnerShip,
  fireEmployer
);
companyRouter.get("/get-company", getCompany);
companyRouter.get("/get-all-company", getAllCompany);
companyRouter.post("/follow", verifyJWT, follow);
companyRouter.get(
  "/get-my-companies",
  verifyJWT,
  getMyCompany
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
