import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true,
  },
  gstVerified: {
    type: Boolean,
    default: true,
  },
  gstNumber: {
    type: String,
    required: true,
    unique: true,
  },
  jobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  ],
  employers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      hireProcess:{
        type: String,
        enum: ["pending", "hired"],
        default: "pending",
      }
    },
  ],
  companyLogo: {
    type: String,
  },
  description: {
    type: String,
  },
  websiteLink: {
    type: String,
    required: true,
  },
  Headquarters: {
    type: String,
  },
  companySize: {
    type: String,
  },
  industry: {
    type: String,
  },
  specialties: {
    type: String,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  companyOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Company = mongoose.model("Company", companySchema);
export default Company;
