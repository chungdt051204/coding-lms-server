import { validateForm } from "../helper/validateForm.js";
import { CategoryService } from "../services/categoryService.js";
import { CourseService } from "../services/courseService.js";
import { LessonService } from "../services/lessonService.js";

export class CourseController {
  addCourse = async (req, res) => {
    try {
      const payload = req.payload;
      const image_url = req?.files?.["image"][0]?.path;
      const thumbnail_url = req?.files?.["thumbnail"][0]?.path;
      const formData = req.body;
      console.log(formData);
      //Vì req.body.lessons là chuỗi nên phải dùng JSON.parse để biến chuỗi thành mảng
      const lessonArray =
        typeof formData.lessons === "string"
          ? JSON.parse(formData.lessons)
          : formData.lessons;
      console.log(lessonArray);
      const categories = await new CategoryService().getAllCategories();
      const categoryIds = categories?.map((value) => {
        return value?.item?._id;
      });
      console.log(categoryIds);
      if (
        validateForm.validateFormCourse({ courseInfo: formData, categoryIds })
      ) {
        const result = await new CourseService().addCourse({
          userId: payload.sub,
          formData,
          image_url,
          thumbnail_url,
        });
        if (lessonArray.length > 0)
          await new LessonService().addLessons({
            lessonArray,
            courseId: result._id,
          });
        return res
          .status(201)
          .json({ message: "Tạo khóa học thành công", data: result });
      }
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getApprovedCourses = async (req, res) => {
    try {
      const params = req.query;
      const result = await new CourseService().getApprovedCourses({ params });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getCoursesByInstructor = async (req, res) => {
    try {
      const payload = req.payload;
      const params = req.query;
      const result = await new CourseService().getCoursesByInstructor({
        instructorId: payload.sub,
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
  getCoursesByAdmin = async (req, res) => {
    try {
      const params = req.query;
      const result = await new CourseService().getCoursesByAdmin({ params });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getCourseById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await new CourseService().getCourseById({ courseId: id });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  updateCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const formData = req.body;
      const image_url = req?.files?.["image"]?.[0]?.path || formData.image;
      const thumbnail_url =
        req?.files?.["thumbnail"]?.[0]?.path || formData.thumbnail;
      let existingLessons = [];
      let newLessons = [];
      const lessonArray = JSON.parse(formData.lessons);
      lessonArray?.map((value) => {
        if (!value.lessonId)
          newLessons.push({
            lessonName: value.lessonName,
            videoUrl: value.videoUrl,
            duration: value.duration,
            order: value.order,
          });
        else {
          existingLessons.push({
            lessonId: value.lessonId,
            lessonName: value.lessonName,
            videoUrl: value.videoUrl,
            duration: value.duration,
            order: value.order,
          });
        }
      });
      const categories = await new CategoryService().getAllCategories();
      const categoryIds = categories?.map((value) => {
        return value?.item?._id;
      });
      if (
        validateForm.validateFormCourse({ courseInfo: formData, categoryIds })
      ) {
        const result = await new CourseService().updateCourse({
          courseId: id,
          formData,
          image_url,
          thumbnail_url,
        });
        //TH giảng viên thêm bài học mới
        if (newLessons?.length > 0)
          await new LessonService().addLessons({
            lessonArray: newLessons,
            courseId: id,
          });
        if (existingLessons?.length > 0)
          //TH giảng viên sửa bài học cũ
          await new LessonService().updateLessons({
            lessonArray: existingLessons,
          });
        return res
          .status(200)
          .json({ message: "Cập nhật thành công", data: result });
      }
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  deleteCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await new CourseService().deleteCourse({ courseId: id });
      await new LessonService().deleteLessons({ courseId: id });
      return res.status(200).json({ message: "Xóa thành công", data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  submitOrUnSubmitCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.query;

      const result = await new CourseService().submitOrUnSubmitCourse({
        courseId: id,
        status,
      });
      return res.status(200).json({
        message:
          status === "pending"
            ? "Đăng tải khóa học thành công"
            : "Hủy đăng tải khóa học thành công",
        data: result,
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  approveOrRejectCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const { message } = req.body;
      const result = await new CourseService().approveOrRejectCourse({
        courseId: id,
        status,
        message,
      });
      return res.status(200).json({
        message:
          status === "approved"
            ? "Duyệt khóa học thành công"
            : "Từ chối khóa học thành công",
        data: result,
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  deleteOrRestoreCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const { action } = req.query;
      const result = await new CourseService().deleteOrRestoreCourse({
        courseId: id,
        action,
      });
      return res.status(200).json({
        message:
          action == "restore"
            ? "Khôi phục lại khóa học thành công"
            : "Xóa khóa học thành công",
        data: result,
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
}
