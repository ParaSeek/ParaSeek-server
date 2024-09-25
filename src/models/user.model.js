import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Job Schema
const jobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Reference to employer user
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  industry: { type: String, required: true },
  location: { type: String, required: true },
  salaryRange: { type: String }, // E.g., "50,000 - 70,000"
  requirements: [String], // Skills or qualifications required
  postedAt: { type: Date, default: Date.now },
  deadline: { type: Date }, // Job application deadline
});

// Application Schema
const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Reference to the job seeker
  },
  status: {
    type: String,
    enum: ["applied", "interview", "rejected", "hired"],
    default: "applied",
  },
  appliedAt: { type: Date, default: Date.now },
});

// User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true, unique: true },
    password: {
      type: String,
    },
    dob: {
      type: Date,
      validate: {
        validator: (value) => value <= Date.now(),
        message: "Date of birth cannot be in the future.",
      },
    },
    gender: { type: String },
    role: {
      type: String,
      enum: ["job_seeker", "employer"],
      default: "job_seeker",
    },
    addresses: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
      },
    ],
    avatar: { type: String },
    experience: { type: Number, default: 0 }, // Years of experience

    // Job seeker-specific
    jobPreferences: {
      industries: [String],
      jobRoles: [String],
      preferredLocation: String,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application", // Reference to the Application schema
      },
    ],

    // Employer-specific
    jobsPosted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job", // Reference to the Job schema
      },
    ],

    resume: { type: String }, // Link to the generated resume
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);
const Job = mongoose.model("Job", jobSchema);
const Application = mongoose.model("Application", applicationSchema);

export { User, Job, Application };
