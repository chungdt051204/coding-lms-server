import { NotificationService } from "../services/notificationService.js";

export class NotificationController {
  getNotifications = async (req, res) => {
    try {
      const payload = req.payload;
      const result = await new NotificationService().getNotifications({
        userId: payload.sub,
      });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  markAsAllRead = async (req, res) => {
    try {
      const payload = req.payload;
      const result = await new NotificationService().markAllAsRead({
        userId: payload.sub,
      });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  deleteReadNotifications = async (req, res) => {
    try {
      const payload = req.payload;
      await new NotificationService().deleteReadNotifications({
        userId: payload.sub,
      });
      return res.status(200).json({ message: "Xóa thông báo thành công" });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
}
