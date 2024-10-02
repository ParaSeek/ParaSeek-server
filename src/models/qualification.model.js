import mongoose from "mongoose";

const qualificationSchema = new mongoose.Schema({
  education: [
    {
      levelOfEducation: String,
      fieldOfStudy: String,
    },
  ],
  skills: [{ type: String }],
  certifications: [
    {
      certificationName: String,
      link: String,
    },
  ],
  languages: [{ type: String }],
  experience: [
    {
      jobTitle: String,
      companyName: String,
      certificate: String,
    },
  ],
});

const Qualification = mongoose.model("Qualification", qualificationSchema);
export { Qualification };
