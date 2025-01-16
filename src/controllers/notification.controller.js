import Notification from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cron from "node-cron";

const getAllNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notifications = await Notification.find({ userId }).sort({
    createdAt: -1,
  });
  if (!notifications) {
    throw ApiError(403, "Failed to fetch all notification");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, notifications, "Get all notification successfully")
    );
});

const updateNotificationStatus = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.isRead) {
    throw new ApiError(404, "Notification is already read");
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not the permission to mark as read");
  }

  notification.isRead = true;

  await notification.save();

  return res.status(200).json(new ApiResponse(200, {}, "mark as read"));
});

const updateAllNotificationsStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find unread notifications for the user
  const notifications = await Notification.find({ userId, isRead: false });

  if (notifications.length === 0) {
    throw new ApiError(404, "No unread notifications found");
  }

  // Update all notifications to mark them as read
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `${notifications.length} notifications marked as read`
      )
    );
});

cron.schedule("0 0 0 * * *", async () => {
  const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 100);
  await Notification.deleteMany({
    status: "read",
    createAt: { $lt: thirtyDayAgo },
  });
  console.log("Deleted read notification");
});

export { updateAllNotificationsStatus, updateNotificationStatus,getAllNotification };
