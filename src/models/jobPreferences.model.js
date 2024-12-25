import mongoose from "mongoose";

const jobPreferences = new mongoose.Schema({
  jobTitles: [{ type: String }],
  jobTypes: [{ type: String }],
  workSchedule: {
    days: String,
    shifts: String,
  },
  minimumBasePay: {
    amount: Number,
    payPeriod: String,
  },
  remote: { type: Boolean, default: false },
});

const Preferences = mongoose.model("Preferences", jobPreferences);
export { Preferences };
