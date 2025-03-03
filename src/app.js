import express from "express";
import { ErrorMiddleware } from "./utils/error.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.route.js";
import { userRouter } from "./routes/user.route.js";
import { qualificationRouter } from "./routes/qualification.route.js";
import { jobPreferencesRouter } from "./routes/jobPreferences.route.js";
import { v2 as cloudinary } from "cloudinary";
import { jobRouter } from "./routes/job.route.js";
import { applicationRouter } from "./routes/application.route.js";
import { adminRouter } from "./routes/admin.route.js";
import companyRouter from "./routes/company.route.js";
import resumeDraftRouter from "./routes/resumeDraft.route.js";
import communityRouter from "./routes/community.route.js";
import messageRouter from "./routes/message.route.js";

dotenv.config();
const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/qualification", qualificationRouter);
app.use("/api/v1/jobPreferences", jobPreferencesRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/draft", resumeDraftRouter);
app.use("/api/v1/community", communityRouter);
app.use("/api/v1/dm", messageRouter)

// unknown route
app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
export { app };
