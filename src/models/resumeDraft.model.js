import mongoose from "mongoose";

const resumeDraftSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: Number,
    min: [1000000000, "Phone number must be at least 10 digits"],
    max: [9999999999, "Phone number must be at most 10 digits"],
  },
  links: [
    {
      title: String,
      url: String,
    },
  ],
  qualification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Qualification",
  },
  nationality: {
    type: String,
  },
  professionalOverview: {
    type: String,
  },
  declaration: {
    type: String,
  },
  hobbies: [String],
  displayDate: {
    type: String,
  },
});

const ResumeDraft = mongoose.model("ResumeDraft", resumeDraftSchema);
export { ResumeDraft };