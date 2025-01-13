import express from 'express';
import verifyJWT from "../middlewares/auth.middleware.js";
import { getResumeDraft, saveResumeDraft } from '../controllers/resumeDraft.controller.js';
const resumeDraftRouter = express.Router();

resumeDraftRouter.get("/get-resume-draft", verifyJWT, getResumeDraft);
resumeDraftRouter.post("/save-resume-draft", verifyJWT, saveResumeDraft);

export default resumeDraftRouter;