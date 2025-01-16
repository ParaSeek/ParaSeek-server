import express from 'express'
import verifyJWT from '../middlewares/auth.middleware.js';
import { getAllNotification, updateAllNotificationsStatus, updateNotificationStatus } from '../controllers/notification.controller.js';

const notificationRouter = express.Router();

notificationRouter.get("/get-notification",verifyJWT,getAllNotification);
notificationRouter.post("/update-status/:notificationId",verifyJWT,updateNotificationStatus);
notificationRouter.post("/update-all-status",verifyJWT,updateAllNotificationsStatus);

export default notificationRouter;
