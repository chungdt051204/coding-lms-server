import express from "express";
export const notificationRouter = express.Router();
import { NotificationController } from "../controllers/notificationController.js";
import { middleware } from "../middlewares/middleware.js";
const prefix = "";
notificationRouter.get(
  `${prefix}/notifications`,
  middleware.verifyToken,
  new NotificationController().getNotifications
);
notificationRouter.put(
  `${prefix}/notifications/read-all`,
  middleware.verifyToken,
  new NotificationController().markAsAllRead
);
notificationRouter.delete(
  `${prefix}/notifications`,
  middleware.verifyToken,
  new NotificationController().deleteReadNotifications
);
