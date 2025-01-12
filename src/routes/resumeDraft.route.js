import express from 'express';
import verifyJWT from "../middlewares/auth.middleware.js";
import { getResumeDraft,saveDraft } from '../controllers/resumeDraft.controller.js';
const resumeDraftRouter = express.Router();

resumeDraftRouter.get("/get-resume",verifyJWT,getResumeDraft);
resumeDraftRouter.post("/save-resuem-draft",verifyJWT,saveDraft);

export default resumeDraftRouter;