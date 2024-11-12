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
    required: true,
  },
  jobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  ],
  employers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  companyLogo: {
    type: String
  },
  description: {
    type: String
  },
  Headquarters:{
    type: String,
  },
  companySize:{
    type: String
  },
  industry: {
    type: String,
  },
  specialties: {
    type: String
  },
  overview: {
    type: String,
  },
  following:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
  ],
  companyOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

const Company = mongoose.model("Company",companySchema);
export default Company;
