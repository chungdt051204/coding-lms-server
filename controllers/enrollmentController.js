import { EnrollmentService } from "../services/enrollmentService.js";
import { NotificationService } from "../services/notificationService.js";
import courseEntity from "../models/courseModel.js";

export class EnrollmentController {
  createEnrollment = async (req, res) => {
    try {
      const payload = req.payload;
      const { data } = req.body;
      const course = await courseEntity.findOne({ _id: data.courseId });
      const result1 = await new EnrollmentService().createEnrollment({
        courseId: data.courseId,
        userId: payload.sub,
        accessLevel: data.accessLevel,
      });
      const result2 = await new NotificationService().createNotification({
        userId: payload.sub,
        type: "ENROLLMENT",
        title: "Đăng ký khóa học thành công",
        message: `Khóa học ${course.course_name} đã được đăng ký thành công`,
      });
      return res.status(200).json({
        message: "Đăng ký học khóa học thành công",
        data: { result1, result2 },
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getEnrollmentsByUser = async (req, res) => {
    try {
      const payload = req.payload;
      const params = req.query;
      const result = await new EnrollmentService().getEnrollmentsByUser({
        userId: payload.sub,
        params,
      });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getAllEnrollments = async (req, res) => {
    try {
      const result = await new EnrollmentService().getAllEnrollments();
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
}
