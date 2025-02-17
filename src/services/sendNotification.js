import admin from "./firebaseAdmin.js";
import { User } from "../models/user.model.js";

const sendNotification = async (userId, title, body) => {
  const user = await User.findById(userId);
  if (!user || !user.fcmToken) return; // Ensure user has FCM token

  const message = {
    token: user.fcmToken,
    notification: { title, body },
  };

  try {
    await admin.messaging().send(message);
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};


export default sendNotification;