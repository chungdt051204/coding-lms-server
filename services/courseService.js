import courseEntity from "../models/courseModel.js";
import enrollmentEntity from "../models/enrollmentModel.js";
import lessonEntity from "../models/lessonModel.js";
import testEntity from "../models/testModel.js";
import ratingEntity from "../models/ratingModel.js";
import { RevenueService } from "./revenueService.js";
import categoryEntity from "../models/categoryModel.js";
import userEntity from "../models/userModel.js";
import roleEntity from "../models/roleModel.js";
import { NotificationService } from "../services/notificationService.js";
import { io } from "../script.js";

export class CourseService {
  addCourse = async ({ userId, formData, image_url, thumbnail_url }) => {
    const newCourse = await courseEntity.create({
      user_id: userId,
      course_name: formData.courseName,
      description: formData.description,
      category_id: formData.category_id,
      level: formData.level,
      requirements: formData.requirements,
      objectives: formData.objectives,
      price: formData.price,
      image_url: image_url,
      thumbnail_url: thumbnail_url,
      is_free: formData.price == 0 ? true : false,
    });
    return newCourse;
  };
  getApprovedCourses = async ({ params }) => {
    let sort = {};
    if (params.option !== undefined) {
      if (params.option == "highest-rating") sort.rating_star = -1;
      else if (params.option == "newest") sort.createdAt = -1;
      else if (params.option == "price-asc" || params.option == "price-desc")
        sort.price = params.option == "price-asc" ? 1 : -1;
    }
    const options = {
      page: params.page,
      limit: params.limit,
      populate: ["category_id", "user_id"],
      sort: sort,
    };
    let query = {};
    if (params.search !== undefined) {
      const categories = await categoryEntity.find({
        category_name: { $regex: params.search, $options: "i" },
      });
      const instructors = await userEntity.find({
        full_name: { $regex: params.search, $options: "i" },
      });
      query = {
        $or: [
          {
            course_name: { $regex: params.search, $options: "i" },
          },
          {
            category_id: {
              $in: categories?.map((value) => {
                return value._id;
              }),
            },
          },
          {
            user_id: {
              $in: instructors?.map((value) => {
                return value._id;
              }),
            },
          },
        ],
      };
    }
    query.status = "approved";
    if (params.categoryId !== undefined) query.category_id = params?.categoryId;
    if (params.level !== undefined) query.level = params?.level;

    const courses = await courseEntity.paginate(query, options);
    const arrayCourse = await Promise.all(
      courses?.docs?.map(async (value) => {
        const totalLesson = await lessonEntity.countDocuments({
          course_id: value._id,
        });
        const numberEnrollment = await enrollmentEntity.countDocuments({
          course_id: value._id,
        });
        return { course: value, totalLesson, numberEnrollment };
      })
    );
    return {
      arrayCourse,
      totalPages: courses.totalPages,
      query,
    };
  };
  getCoursesByInstructor = async ({ instructorId, params }) => {
    const options = {
      page: params.page,
      limit: params.limit,
      sort: { createdAt: -1 },
      populate: ["category_id"],
    };
    let query = { user_id: instructorId };
    query.is_visible = true;
    if (params?.status !== undefined) {
      if (params.status == "deleted") query.is_visible = false;
      else query.status = params.status;
    }
    const courses = await courseEntity.paginate(query, options);
    const arrayCourse = await Promise.all(
      courses?.docs?.map(async (value) => {
        const numberLesson = await lessonEntity.countDocuments({
          course_id: value._id,
        });
        const numberTest = await testEntity.countDocuments({
          course_id: value._id,
          is_active: true,
        });
        const numberEnrollment = await enrollmentEntity.countDocuments({
          course_id: value._id,
        });
        const revenue = await new RevenueService().getRevenueOfCourse({
          courseId: value._id,
        });
        return {
          course: value,
          numberLesson,
          numberTest,
          numberEnrollment,
          revenue,
        };
      })
    );
    return { arrayCourse, totalPages: courses?.totalPages };
  };
  getCoursesByAdmin = async ({ params }) => {
    const options = {
      page: params.page,
      limit: params.limit,
      sort: { updatedAt: -1 },
      populate: ["category_id", "user_id"],
    };
    const arrayStatus = ["pending", "approved", "rejected"];
    let query = { status: { $in: arrayStatus } };
    if (params?.status !== undefined) {
      query.status = params.status;
    }
    const courses = await courseEntity.paginate(query, options);
    const arrayCourse = await Promise.all(
      courses?.docs?.map(async (value) => {
        const numberEnrollment = await enrollmentEntity.countDocuments({
          course_id: value._id,
        });
        return { course: value, numberEnrollment };
      })
    );
    return { arrayCourse, totalPages: courses?.totalPages };
  };
  getCourseById = async ({ courseId }) => {
    const course = await courseEntity
      .findOne({ _id: courseId })
      .populate("category_id")
      .populate("user_id");
    if (!course) {
      const error = new Error("Không tìm thấy khóa học này!");
      error.statusCode = 404;
      throw error;
    }
    const numberEnrollment = await enrollmentEntity.countDocuments({
      course_id: course._id,
    });
    let totalStar = 0;
    let averageStar = 0;
    const ratings = await ratingEntity
      .find({ course_id: courseId })
      .sort({ createdAt: -1 })
      .populate("user_id");
    ratings?.forEach((value) => {
      totalStar = totalStar + value.rating_star;
      averageStar = Number(totalStar / ratings?.length).toFixed(1);
    });
    const ratingStar = Array.from({ length: 5 });
    let ratingStats = await Promise.all(
      ratingStar?.map(async (_, i) => {
        const count = await ratingEntity.countDocuments({
          course_id: courseId,
          rating_star: Number(i + 1),
        });
        return { star: i + 1, count };
      })
    );
    ratingStats.reverse();
    const lessons = await lessonEntity
      .find({ course_id: courseId })
      .sort({ order: 1 });
    return {
      item: course,
      numberEnrollment,
      ratings,
      averageStar,
      ratingStats,
      lessons,
    };
  };
  updateCourse = async ({ courseId, formData, image_url, thumbnail_url }) => {
    const course = await courseEntity.findOne({ _id: courseId });
    if (!course) {
      const error = new Error("Không tìm thấy khóa học này!");
      error.statusCode = 404;
      throw error;
    }
    const result = await courseEntity
      .findOneAndUpdate(
        { _id: courseId },
        {
          course_name: formData.courseName,
          description: formData.description,
          category_id: formData.category_id,
          level: formData.level,
          image_url: image_url == null ? course.image_url : image_url,
          thumbnail_url:
            thumbnail_url == null ? course.thumbnail_url : thumbnail_url,
          requirements: formData.requirements,
          objectives: formData.objectives,
          price: formData.price,
          is_free: formData.price == 0 ? true : false,
        }
      )
      .populate("category_id");
    return result;
  };
  deleteCourse = async ({ courseId }) => {
    const result = await courseEntity.findOneAndDelete({ _id: courseId });
    if (!result) {
      const error = new Error("Không tìm thấy khóa học để xóa!");
      error.statusCode = 404;
      throw error;
    }
    return result;
  };
  submitOrUnSubmitCourse = async ({ courseId, status }) => {
    const allowedStatus = ["pending", "draft"];
    if (!allowedStatus.includes(status)) {
      const error = new Error(
        "Không thể thiết lập trạng thái này cho khóa học!"
      );
      error.statusCode = 400;
      throw error;
    }
    const course = await courseEntity
      .findOne({ _id: courseId })
      .populate("user_id");
    if (!course) {
      const error = new Error(
        "Không tìm thấy khóa học để cập nhật trạng thái!"
      );
      error.statusCode = 404;
      throw error;
    }
    if (course.status !== "approved") {
      const result = await courseEntity
        .findOneAndUpdate(
          { _id: courseId },
          { status },
          { returnDocument: "after" }
        )
        .populate("category_id");
      const numberEnrollment = await enrollmentEntity.countDocuments({
        course_id: result,
      });
      const role = await roleEntity.findOne({ role: "admin" });
      const admin = await userEntity.findOne({ role_id: role?._id });
      await new NotificationService().createNotification({
        message:
          status == "pending"
            ? `${course?.user_id?.full_name} đã gửi yêu cầu xét duyệt khóa học cho bạn`
            : `${course?.user_id?.full_name} đã hủy yêu cầu xét duyệt khóa học`,
        title:
          status == "pending"
            ? "Yêu cầu xét duyệt khóa học"
            : "Hủy yêu cầu xét duyệt khóa học",
        type: "COURSE",
        userId: admin?._id,
      });
      io.to(admin?._id?.toString()).emit("course-review");
      return { course: result, numberEnrollment };
    } else {
      const error = new Error(
        "Khóa học đã được đăng tải, không thể thay đổi trạng thái!"
      );
      error.statusCode = 400;
      throw error;
    }
  };
  approveOrRejectCourse = async ({ courseId, status, message }) => {
    const allowedStatus = ["approved", "rejected"];
    if (!allowedStatus.includes(status)) {
      const error = new Error(
        "Không thể thiết lập trạng thái này cho khóa học!"
      );
      error.statusCode = 400;
      throw error;
    }
    const course = await courseEntity
      .findOne({ _id: courseId })
      .populate("user_id");
    if (!course) {
      const error = new Error(
        "Không tìm thấy khóa học để cập nhật trạng thái!"
      );
      error.statusCode = 404;
      throw error;
    }
    if (course.status === "pending") {
      const result = await courseEntity
        .findOneAndUpdate(
          { _id: courseId },
          { status },
          { returnDocument: "after" }
        )
        .populate("category_id")
        .populate("user_id");
      const numberEnrollment = await enrollmentEntity.countDocuments({
        course_id: result,
      });
      await new NotificationService().createNotification({
        message:
          status == "approved"
            ? "Yêu cầu xét duyệt khóa học của bạn đã được quản trị viên duyệt"
            : `Lý do: ${message}`,
        title:
          status === "approved"
            ? "Xét duyệt khóa học thành công"
            : "Yêu cầu xét duyệt khóa học của bạn đã bị quản trị viên từ chối",
        type: "COURSE",
        userId: course?.user_id?._id,
      });
      io.to(course?.user_id?._id?.toString()).emit("course-review-result");
      return { course: result, numberEnrollment };
    } else {
      const error = new Error("không thể thay đổi trạng thái của khóa học!");
      error.statusCode = 400;
      throw error;
    }
  };
  deleteOrRestoreCourse = async ({ courseId, action }) => {
    const allowedStatus = ["draft", "rejected"];
    const allowedActions = ["delete", "restore"];
    const course = await courseEntity.findOne({ _id: courseId });
    if (!course) {
      const error = new Error(
        "Không tìm thấy khóa học để thực hiện hành động này!"
      );
      error.statusCode = 404;
      throw error;
    }
    if (!allowedStatus.includes(course.status)) {
      const error = new Error("không thể xóa khóa học này khi đã đăng tải!");
      error.statusCode = 400;
      throw error;
    }
    if (!allowedActions.includes(action)) {
      const error = new Error("không thể thực hiện hành động này!");
      error.statusCode = 400;
      throw error;
    }
    const result = await courseEntity
      .findOneAndUpdate(
        { _id: courseId },
        { is_visible: action === "delete" ? false : true },
        { returnDocument: "after" }
      )
      .populate("category_id");
    const numberEnrollment = await enrollmentEntity.countDocuments({
      course_id: result,
    });
    return { course: result, numberEnrollment };
  };
}
