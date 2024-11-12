import express from 'express';
import verifyJWT from "../middlewares/auth.middleware.js";
import verfiyOwnerShip from '../middlewares/verifyOwnerShip.middleware.js';
import { upload } from "../middlewares/multer.middleware.js";
import { createCompany, getCompany, hireEmployer, updateInfoCompany, uploadLogo } from '../controllers/company.controller.js';

const companyRouter = express.Router();

companyRouter.post('/create-company',verifyJWT,createCompany);
companyRouter.patch('/hire-employers',verifyJWT,verfiyOwnerShip,hireEmployer);
companyRouter.get('/get-company',getCompany);
companyRouter.patch('/update-company-info',verifyJWT,verfiyOwnerShip,updateInfoCompany);
companyRouter.post('/upload-logo',verifyJWT,verfiyOwnerShip,upload.single("companyLogo"),uploadLogo);

export default companyRouter;