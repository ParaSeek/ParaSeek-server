import mongoose from "mongoose";

const jobQuestionSchema = new mongoose.Schema(
  {
    jobQuestions: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    questions: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    companyName: { type: String, required: true, unique: true },
    location: {
      city: { type: String },
      state: { type: String },
      country: { type: String },
    },
    employmentType: { type: String, required: true }, // full-time, part-time, etc.
    remote: { type: Boolean, default: false },
    salaryRange: {
      minSalary: { type: Number },
      maxSalary: { type: Number },
      currency: { type: String, default: "USD" },
    },
    experienceLevel: {
      type: String,
      enum: ["Entry Level", "Mid Level", "Senior Level"],
    },
    jobType: { type: String, required: true }, // e.g., Technical, Marketing
    skills: [String],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the employer
    postedDate: { type: Date, default: Date.now },
    applicationDeadline: { type: Date },
    isActive: { type: Boolean, default: true },
    requiredEducation: { type: String },
    requiredLanguages: [String],
    numberOfOpenings: { type: Number },
    applicationLink: { type: String },
    contactEmail: { type: String },
    applicationInstructions: { type: String },
    benefits: [String], // e.g., Health Insurance, Paid Time Off
    workHours: { type: String }, // e.g., "9 AM - 5 PM"
    googleDriveFolderId: { type: String },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
const JobQuestion = mongoose.model("JobQuestion", jobQuestionSchema);

export { Job, JobQuestion };
