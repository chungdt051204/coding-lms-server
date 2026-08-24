import testEntity from "../models/testModel.js";
import questionEntity from "../models/questionModel.js";
import courseEntity from "../models/courseModel.js";
import { QuestionService } from "./questionService.js";
import { OptionService } from "./optionService.js";
import testResultEntity from "../models/testResultModel.js";

export class TestService {
  getTestsByInstructor = async ({ instructorId, params }) => {
    const courses = await courseEntity.find({ user_id: instructorId });
    const courseIds =
      courses?.map((value) => {
        return value._id;
      }) || [];
    const options = {
      page: params.page,
      limit: params.limit,
      populate: ["course_id"],
      sort: { createdAt: -1 },
    };
    let query = { course_id: { $in: courseIds } };
    if (params?.status !== undefined) {
      query.is_active = params.status == "active" ? true : false;
    }
    const tests = await testEntity.paginate(query, options);
    const arrayTest = await Promise.all(
      tests?.docs?.map(async (value) => {
        const numberQuestion = await questionEntity.countDocuments({
          test_id: value._id,
        });
        const numberAttempt = await testResultEntity.countDocuments({
          test_id: value._id,
        });
        return { test: value, numberQuestion, numberAttempt };
      })
    );
    return { arrayTest, totalPages: tests?.totalPages };
  };
  getTestById = async ({ testId }) => {
    const test = await testEntity.findOne({ _id: testId });
    if (!test) {
      const error = new Error("Không tìm thấy bài kiểm tra này!");
      error.statusCode = 404;
      throw error;
    }
    return test;
  };
  getTestByCourse = async ({ courseId }) => {
    const course = await courseEntity.findOne({ _id: courseId });
    if (!course) {
      const error = new Error("Không tìm thấy khóa học này!");
      error.statusCode = 404;
      throw error;
    }
    const test = await testEntity.findOne({ course_id: courseId });
    if (!test) {
      const error = new Error("Khóa học này chưa có bài kiểm tra nào!");
      throw error;
    }
    const numberQuestion = await questionEntity.countDocuments({
      test_id: test?._id,
    });
    return { item: test, numberQuestion };
  };
  createTest = async ({ formData }) => {
    const test = await testEntity.findOne({ course_id: formData.courseId });
    if (test) {
      const error = new Error(
        "Khóa học này đã có bài kiểm tra, không thể tạo thêm!"
      );
      error.statusCode = 409;
      throw error;
    }
    const newTest = await testEntity.create({
      test_name: formData.testName,
      course_id: formData.courseId,
      duration_minutes: formData.durationMinutes,
      pass_score: formData.passScore,
    });
    return newTest;
  };
  deleteTest = async ({ testId }) => {
    const test = await testEntity.findOne({ _id: testId });
    if (!test) {
      const error = new Error("Không tìm thấy bài kiểm tra để xóa!");
      error.statusCode = 404;
      throw error;
    }
    const questions = await questionEntity.find({ test_id: testId });
    await testEntity.deleteOne({ _id: testId });
    await new QuestionService().deleteQuestions({ testId });
    await new OptionService().deleteOptions({ questions });
  };
  updateTest = async ({ testId, formData }) => {
    const test = await testEntity.findOne({ _id: testId });
    if (!test) {
      const error = new Error(
        "Không tìm thấy bài kiểm tra để chỉnh sửa thông tin!"
      );
      error.statusCode = 404;
      throw error;
    }
    const result = await testEntity
      .findOneAndUpdate(
        { _id: testId },
        {
          course_id: formData.courseId,
          test_name: formData.testName,
          duration_minutes: formData.durationMinutes,
          pass_score: formData.passScore,
        },
        {
          returnDocument: "after",
        }
      )
      .populate("course_id");
    const numberQuestion = await questionEntity.countDocuments({
      test_id: result._id,
    });
    return { test: result, numberQuestion };
  };
  activeTest = async ({ testId }) => {
    const test = await testEntity.findOne({ _id: testId });
    if (!test) {
      const error = new Error("Bài kiểm tra này không tồn tại!");
      error.statusCode = 404;
      throw error;
    }
    const result = await testEntity
      .findOneAndUpdate(
        { _id: testId },
        { is_active: true },
        { returnDocument: "after" }
      )
      .populate("course_id");
    const numberQuestion = await questionEntity.countDocuments({
      test_id: result._id,
    });
    return { test: result, numberQuestion };
  };
}
