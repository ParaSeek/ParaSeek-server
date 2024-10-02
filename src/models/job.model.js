import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, 
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

const Job = mongoose.model("Job", jobSchema);
export { Job };
