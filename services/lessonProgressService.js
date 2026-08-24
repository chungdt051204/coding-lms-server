import lessonProgressEntity from "../models/lessonProgressModel.js";
import lessonEntity from "../models/lessonModel.js";
import { EnrollmentService } from "../services/enrollmentService.js";
export class LessonProgressService {
  getLessonProgressesByUser = async ({ userId }) => {
    const lessonProgresses = await lessonProgressEntity
      .find({
        user_id: userId,
      })
      .populate("lesson_id");
    return lessonProgresses || [];
  };
  createLessonProgress = async ({ lessonId, userId }) => {
    const lesson = await lessonEntity.findOne({ _id: lessonId });
    if (!lesson) {
      const error = new Error("Bài học này không tồn tại!");
      error.statusCode = 404;
      throw error;
    }
    const existingLessonProgress = await lessonProgressEntity.findOne({
      user_id: userId,
      lesson_id: lessonId,
    });
    if (existingLessonProgress) {
      const error = new Error("Bài học này đã được lưu tiến độ");
      error.statusCode = 409;
      throw error;
    }
    const newLessonProgress = await lessonProgressEntity.create({
      lesson_id: lessonId,
      user_id: userId,
    });
    await newLessonProgress.populate("lesson_id");
    return newLessonProgress;
  };
  updateLessonProgress = async ({ lessonId, userId, currentTime }) => {
    const lesson = await lessonEntity.findOne({ _id: lessonId });
    if (!lesson) {
      const error = new Error("Bài học này không tồn tại!");
      error.statusCode = 404;
      throw error;
    }
    const result = await lessonProgressEntity
      .findOneAndUpdate(
        {
          lesson_id: lessonId,
          user_id: userId,
        },
        {
          current_time: currentTime,
          is_completed: currentTime / lesson.duration >= 0.99,
        },
        { returnDocument: "after" }
      )
      .populate("lesson_id");
    if (result.is_completed) {
      const lesson = await lessonEntity.findOne({ _id: lessonId });
      const courseId = lesson?.course_id;
      const totalLessons = await lessonEntity.countDocuments({
        course_id: courseId,
      });
      const enrollment =
        await new EnrollmentService().getEnrollmentByUserAndCourse({
          courseId,
          userId,
        });
      if (enrollment !== null) {
        const newCompleted = enrollment.completed_lessons + 1;
        const progressPercent = Math.floor((newCompleted / totalLessons) * 60);
        await new EnrollmentService().updateEnrollment({
          enrollmentId: enrollment._id,
          progressPercent,
        });
      }
    }
    return result;
  };
}
