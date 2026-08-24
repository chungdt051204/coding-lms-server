import userEntity from "../models/userModel.js";
import courseEntity from "../models/courseModel.js";
import enrollmentEntity from "../models/enrollmentModel.js";
import orderEntity from "../models/orderModel.js";
import orderItemEntity from "../models/orderItemModel.js";
import roleEntity from "../models/roleModel.js";
import testEntity from "../models/testModel.js";
import testResultEntity from "../models/testResultModel.js";
import { NotificationService } from "../services/notificationService.js";
import bcrypt from "bcrypt";
const saltRounds = 10;
import { io } from "../script.js";

export class UserService {
  getUserProfile = async ({ payload }) => {
    const me = await userEntity
      .findOne({ _id: payload.sub })
      .populate("role_id")
      .select("-password"); //Thêm dấu - đằng trước là lấy tất cả thuộc tính khác ngoại trừ thuộc tính này
    if (!me) {
      const error = new Error("Tài khoản không tồn tại hoặc đã bị xóa");
      error.statusCode = 404;
      throw error;
    }
    return me;
  };
  getInstructors = async ({ params }) => {
    const instructorRole = await roleEntity.findOne({ role: "instructor" });
    const options = {
      page: params.page,
      limit: params.limit,
      sort: { updatedAt: -1 },
    };
    let query = { role_id: instructorRole?._id };
    if (params?.status !== undefined) {
      query.status = params.status == "active" ? true : false;
    }
    const instructors = await userEntity.paginate(query, options);
    const arrayInstructor = await Promise.all(
      instructors?.docs?.map(async (value) => {
        const numberCourse = await courseEntity.countDocuments({
          user_id: value._id,
        });
        return { item: value, numberCourse };
      })
    );
    return { arrayInstructor, totalPages: instructors?.totalPages };
  };
  getUsers = async ({ params }) => {
    const userRole = await roleEntity.findOne({ role: "user" });
    const options = {
      page: params.page,
      limit: params.limit,
      sort: { createdAt: -1 },
    };
    let query = { role_id: userRole._id };
    if (params?.status !== undefined) {
      query.status = params.status == "active" ? true : false;
    }
    const users = await userEntity.paginate(query, options);
    const arrayUser = await Promise.all(
      users?.docs?.map(async (value) => {
        const enrollments = await enrollmentEntity
          .find({ user_id: value._id })
          .populate("course_id");
        const numberPurchasedCourse = enrollments?.filter(
          (value) => !value?.course_id?.is_free
        )?.length;
        let totalSpent = 0;
        const orders = await orderEntity.find({
          user_id: value._id,
          payment_status: { $in: ["PARTIAL_PAID", "PAID"] },
        });
        orders?.forEach((value) => {
          totalSpent = totalSpent + value.applied_amount;
        });
        return { item: value, numberPurchasedCourse, totalSpent };
      })
    );
    return { arrayUser, totalPages: users?.totalPages };
  };
  getInstructorById = async ({ instructorId }) => {
    const user = await userEntity
      .findOne({ _id: instructorId })
      .populate("role_id");
    if (!user) {
      const error = new Error("Không tìm thấy tài khoản giảng viên này!");
      error.statusCode = 404;
      throw error;
    } else if (user?.role_id?.role !== "instructor") {
      const error = new Error("Tài khoản này không phải tài khoản giảng viên!");
      error.statusCode = 400;
      throw error;
    }
    const courses = await courseEntity
      .find({ user_id: user._id })
      .populate("category_id");
    let numberEnrollment = 0;
    let totalRevenue = 0;
    const arrayCourse = await Promise.all(
      courses?.map(async (value) => {
        const numberStudent = await enrollmentEntity.countDocuments({
          course_id: value._id,
        });
        numberEnrollment = numberEnrollment + numberStudent;
        const orders = await orderEntity.find({
          payment_status: { $in: ["PARTIAL_PAID", "PAID"] },
        });
        let revenue = 0;
        await Promise.all(
          orders?.map(async (item) => {
            const orderItems = await orderItemEntity.find({
              order_id: item._id,
              course_id: value._id,
            });
            orderItems?.forEach((value) => {
              revenue = revenue + value.applied_amount;
            });
          })
        );
        totalRevenue = totalRevenue + revenue;
        return { item: value, numberStudent, revenue };
      })
    );
    return {
      item: user,
      numberCourse: arrayCourse?.length,
      numberEnrollment,
      totalRevenue,
      arrayCourse,
    };
  };
  getUserById = async ({ userId }) => {
    const user = await userEntity.findOne({ _id: userId }).populate("role_id");
    if (!user) {
      const error = new Error("Không tìm thấy tài khoản người dùng này!");
      error.statusCode = 404;
      throw error;
    } else if (user?.role_id?.role !== "user") {
      const error = new Error("Tài khoản này không phải tài khoản người dùng!");
      error.statusCode = 400;
      throw error;
    }
    const enrollments = await enrollmentEntity
      .find({ user_id: userId })
      .populate("course_id");
    const courseIds = enrollments?.map((value) => {
      return value?.course_id?._id;
    });
    const arrayCourse = await courseEntity
      .find({ _id: { $in: courseIds } })
      .populate("category_id")
      .populate("user_id");
    const numberCourse = await enrollmentEntity.countDocuments({
      user_id: userId,
    });
    const orders = await orderEntity.find({
      user_id: userId,
      payment_status: { $in: ["PARTIAL_PAID", "PAID"] },
    });
    let totalAmount = 0;
    orders?.forEach((value) => {
      totalAmount = totalAmount + value.applied_amount;
    });
    return { item: user, numberCourse, arrayCourse, totalAmount };
  };
  getStudentsByInstructor = async ({ instructorId, params }) => {
    const courses = await courseEntity.find({ user_id: instructorId });
    const courseIds = courses?.map((value) => {
      return value._id;
    });
    const enrollments = await enrollmentEntity.find({
      course_id: { $in: courseIds },
    });
    const enrollmentIds = enrollments?.map((value) => {
      return value.user_id;
    });
    const options = {
      page: params?.page,
      limit: params?.limit,
      sort: { createdAt: -1 },
    };
    const query = { _id: { $in: enrollmentIds } };
    const students = await userEntity.paginate(query, options);
    return {
      items: students?.docs,
      totalPages: students?.totalPages,
    };
  };
  getStudentById = async ({ studentId, instructorId, params }) => {
    const student = await userEntity.findOne({ _id: studentId });
    if (!student) {
      const error = new Error("Không tìm thấy tài khoản học viên này!");
      error.statusCode = 404;
      throw error;
    }
    const courses = await courseEntity.find({ user_id: instructorId });
    const coursesIds = courses?.map((value) => {
      return value._id;
    });
    const totalEnrollments = await enrollmentEntity.find({
      user_id: student._id,
      course_id: { $in: coursesIds },
    });
    const options = {
      page: params?.page,
      limit: params?.limit,
      populate: ["course_id"],
    };
    let query = { user_id: student._id, course_id: { $in: coursesIds } };
    const enrollments = await enrollmentEntity.paginate(query, options);
    const arrayEnrollment = await Promise.all(
      enrollments?.docs?.map(async (value) => {
        const test = await testEntity.findOne({
          course_id: value?.course_id?._id,
        });
        const testResults = await testResultEntity
          .find({ test_id: test._id, user_id: studentId })
          .populate("test_id")
          .sort({ submitted_at: -1 });
        return { item: value, testResults };
      })
    );
    return {
      item: student,
      totalEnrollments,
      arrayEnrollment,
      totalPagesEnrollment: enrollments?.totalPages,
    };
  };
  sendRequestVerification = async ({ userId, images }) => {
    const instructor = await userEntity.findOne({ _id: userId });
    if (!instructor) {
      const error = new Error("Tài khoản không tồn tại !");
      error.statusCode = 404;
      throw error;
    }
    await userEntity.updateOne(
      { _id: userId },
      {
        front_id_card: images?.frontIdCard,
        back_id_card: images?.backIdCard,
        degree_certificate: images?.degreeCertificate,
        verified_status: "PENDING",
      }
    );
    const role = await roleEntity.findOne({ role: "admin" });
    const admin = await userEntity.findOne({ role_id: role?._id });
    await new NotificationService().createNotification({
      message: `${instructor?.full_name} đã gửi yêu cầu xác thực tài khoản cho bạn`,
      title: "Yêu cầu xác thực tài khoản",
      type: "ACCOUNT",
      userId: admin?._id,
    });
    io.to(admin?._id?.toString()).emit("account-review");
  };
  cancelRequestVerification = async ({ userId }) => {
    const instructor = await userEntity.findOne({ _id: userId });
    if (!instructor) {
      const error = new Error("Tài khoản không tồn tại !");
      error.statusCode = 404;
      throw error;
    }
    await userEntity.updateOne(
      { _id: userId },
      {
        verified_status: "NOT_VERIFIED",
      }
    );
    const role = await roleEntity.findOne({ role: "admin" });
    const admin = await userEntity.findOne({ role_id: role?._id });
    await new NotificationService().createNotification({
      message: `${instructor?.full_name} đã hủy yêu cầu xác thực tài khoản`,
      title: "Hủy yêu cầu xác thực tài khoản",
      type: "ACCOUNT",
      userId: admin?._id,
    });
    io.to(admin?._id?.toString()).emit("account-review");
  };
  approvedOrRejectedInstructor = async ({ instructorId, status, message }) => {
    const instructor = await userEntity.findOne({ _id: instructorId });
    if (!instructor) {
      const error = new Error("Tài khoản không tồn tại !");
      error.statusCode = 404;
      throw error;
    }
    await userEntity.updateOne(
      { _id: instructorId },
      { verified_status: status }
    );
    await new NotificationService().createNotification({
      message:
        status === "VERIFIED"
          ? "Yêu cầu xác thực tài khoản của bạn đã được quản trị viên duyệt"
          : `Lý do: ${message}`,
      title:
        status === "VERIFIED"
          ? "Xác thực tài khoản thành công"
          : "Yêu cầu xác thực của bạn đã bị quản trị viên từ chối",
      type: "ACCOUNT",
      userId: instructorId,
    });
    io.to(instructorId).emit("account-review-result");
  };
  updateAvatar = async ({ userId, avatar }) => {
    const user = await userEntity.findOne({ _id: userId });
    if (!user) {
      const error = new Error("Tài khoản không tồn tại !");
      error.statusCode = 404;
      throw error;
    }
    await userEntity.updateOne({ _id: userId }, { avatar });
  };
  updateProfile = async ({ userId, formData }) => {
    const user = await userEntity.findOne({ _id: userId });
    if (!user) {
      const error = new Error("Tài khoản không tồn tại!");
      error.statusCode = 404;
      throw error;
    }
    // const hashedPassword = await bcrypt.hash(formData.password, saltRounds);
    await userEntity.updateOne(
      { _id: userId },
      {
        full_name: formData.fullName,
        phone: formData.phone,
      }
    );
  };
  changePassword = async ({ userId, password }) => {
    const user = await userEntity.findOne({ _id: userId });
    if (!user) {
      const error = new Error("Tài khoản không tồn tại!");
      error.statusCode = 404;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await userEntity.updateOne({ _id: userId }, { password: hashedPassword });
  };
  updateStatusUser = async ({ userId }) => {
    const user = await userEntity.findOne({ _id: userId });
    if (!user) {
      const error = new Error(
        "Không tìm thấy người dùng để cập nhật trạng thái!"
      );
      error.statusCode = 404;
      throw error;
    }
    const currentStatus = user.status;
    const result = await userEntity.findOneAndUpdate(
      { _id: userId },
      { status: currentStatus ? false : true },
      { returnDocument: "after" }
    );
    io.to(userId).emit("change-status");
    return result;
  };
  updateInstructorInfo = async ({ instructorId, formData }) => {
    const user = await userEntity.findOne({ _id: instructorId });
    if (!user) {
      const error = new Error(
        "Không tìm thấy giảng viên để cập nhật thông tin!"
      );
      error.statusCode = 404;
      throw error;
    }
    await userEntity.updateOne(
      { _id: instructorId },
      { level: formData.level, experience: formData.experience }
    );
  };
}
