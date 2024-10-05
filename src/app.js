import express from "express";
import { ErrorMiddleware } from "./utils/error.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.route.js";
import { userRouter } from "./routes/user.route.js";
import { qualificationRouter } from "./routes/qualification.route.js";
import { jobPreferencesRouter } from "./routes/jobPreferences.route.js";
import {v2 as cloudinary} from "cloudinary"
import { jobRouter } from "./routes/job.route.js";
dotenv.config();
const app = express();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// auth route
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user",userRouter);
app.use('/api/v1/qualification',qualificationRouter);
app.use('/api/v1/jobPreferences',jobPreferencesRouter);
app.use('/api/v1/job',jobRouter);

// unknown route
app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
export { app };
