import lessonEntity from "../models/lessonModel.js";
import enrollmentEntity from "../models/enrollmentModel.js";
import userEntity from "../models/userModel.js";
export class LessonService {
  addLessons = async ({ lessonArray, courseId }) => {
    const lessonPromise = lessonArray?.map((value) => {
      return lessonEntity.create({
        course_id: courseId,
        lesson_name: value.lessonName,
        video_url: value.videoUrl,
        duration: value.duration,
        order: value.order,
      });
    });
    await Promise.all(lessonPromise);
  };
  getLessonsByCourse = async ({ courseId }) => {
    const lessons = await lessonEntity
      .find({ course_id: courseId })
      .sort({ order: 1 });
    return lessons || [];
  };
  getLessonById = async ({ lessonId, courseId, userId }) => {
    const user = await userEntity.findOne({ _id: userId }).populate("role_id");
    const isAdmin = user?.role_id?.role == "admin";
    const isInstructor = user?.role_id?.role == "instructor";
    const enrollment = await enrollmentEntity.findOne({
      course_id: courseId,
      user_id: userId,
    });
    if (!enrollment && !isAdmin && !isInstructor) {
      const error = new Error("Bạn chưa sỡ hữu khóa học này!");
      error.statusCode = 403;
      throw error;
    }
    const lesson = await lessonEntity.findOne({ _id: lessonId });
    if (!lesson) {
      const error = new Error("Không tìm thấy bài học này!");
      error.statusCode = 404;
      throw error;
    }
    return lesson;
  };
  updateLessons = async ({ lessonArray }) => {
    let flag = false;
    const lessonPromise = lessonArray.map((value) => {
      return lessonEntity.updateOne(
        { _id: value.lessonId },
        {
          lesson_name: value.lessonName,
          video_url: value.videoUrl || "",
          duration: value.duration || 0,
        }
      );
    });
    await Promise.all(lessonPromise);
    flag = true;
    return flag;
  };
  deleteLesson = async ({ lessonId }) => {
    const result = await lessonEntity.deleteOne({ _id: lessonId });
    if (result.deletedCount === 0) {
      const error = new Error("Không tìm thấy bài học để xóa");
      error.statusCode = 404;
      throw error;
    }
  };
}
