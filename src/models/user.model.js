import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: Number },
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true, unique: true,lowercase:true },
    password: { type: String },
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    location: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    profilePic: { type: String },
    jobPreferences: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Preferences",
    },
    qualification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Qualification",
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    jobsPosted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Company",
      }
    ],
    resume: { type: String },
    tokens:{
      type:Object
    },
    verifyCode: {
      type: String,
      default:"",
    },    
    verifyCodeExpiry: {
      type: Date,
      default:null,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
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
      expiresIn: "3d",
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
      expiresIn: "7d",
    }
  );
};

const User = mongoose.model("User", userSchema);
export { User };
