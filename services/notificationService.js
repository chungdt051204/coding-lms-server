import notificationEntity from "../models/notificationModel.js";
export class NotificationService {
  createNotification = async ({ userId, type, title, message }) => {
    const newNotification = await notificationEntity.create({
      user_id: userId,
      type,
      title,
      message,
    });
    return newNotification;
  };
  getNotifications = async ({ userId }) => {
    const notification = await notificationEntity
      .find({ user_id: userId })
      .sort({ createdAt: -1 });
    return notification || [];
  };
  markAllAsRead = async ({ userId }) => {
    await notificationEntity.updateMany(
      { user_id: userId, is_read: false },
      { $set: { is_read: true } }
    );
    const notifications = await notificationEntity
      .find({ user_id: userId })
      .sort({ createdAt: -1 });
    return notifications || [];
  };
  deleteReadNotifications = async ({ userId }) => {
    await notificationEntity.deleteMany({ user_id: userId, is_read: true });
  };
}
