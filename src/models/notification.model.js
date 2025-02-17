import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: ["job_application", "follow", "new_job"],
    required: true,
  },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, // For job-related notifications
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" }, // For company-related notifications
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
},{timestamps: true});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
