import mongoose from "mongoose";

const qualificationSchema = new mongoose.Schema({
  education: [
    {
      levelOfEducation: String,
      fieldOfStudy: String,
      boardOrUniversity: String, //newly added
      institute: String, //newly added
      from: String, //newly added
      to: String,
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
      description: String,
      from: String,
      to: String,
    },
  ],
  projects: [
    {
      title: String,
      overview: String,
      role: String,
      link: String,
    },
  ],
});

const Qualification = mongoose.model("Qualification", qualificationSchema);
export { Qualification };
