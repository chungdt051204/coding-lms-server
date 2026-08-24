import { LessonService } from "../services/lessonService.js";
export class LessonController {
  getLessonsByCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const result = await new LessonService().getLessonsByCourse({
        courseId: courseId,
      });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getLessonById = async (req, res) => {
    try {
      const payload = req.payload;
      const { courseId, id } = req.params;
      const result = await new LessonService().getLessonById({
        lessonId: id,
        courseId,
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
  deleteLesson = async (req, res) => {
    try {
      const { id } = req.params;
      await new LessonService().deleteLesson({ lessonId: id });
      return res.status(200).json({ message: "Xóa bài học thành công" });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
}
