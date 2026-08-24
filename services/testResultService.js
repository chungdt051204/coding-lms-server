import testResultEntity from "../models/testResultModel.js";
import testEntity from "../models/testModel.js";
import enrollmentEntity from "../models/enrollmentModel.js";
import questionEntity from "../models/questionModel.js";
import optionEntity from "../models/optionModel.js";

export class TestResultService {
  getTestResultById = async ({ testResultId }) => {
    const testResult = await testResultEntity
      .findOne({ _id: testResultId })
      .populate("test_id");
    if (!testResultId) {
      const error = new Error("Không tìm thấy kết quả bài kiểm tra!");
      error.statusCode = 404;
      throw error;
    }
    const numberQuestion = await questionEntity.countDocuments({
      test_id: testResult?.test_id,
    });
    return { item: testResult, numberQuestion };
  };
  getTestResultsByTest = async ({ testId, userId }) => {
    const test = await testEntity.findOne({ _id: testId });
    if (!test) {
      const error = new Error("Không tìm thấy bài kiểm tra này!");
      error.statusCode = 404;
      throw error;
    }
    const testResults = await testResultEntity
      .find({ test_id: testId, user_id: userId })
      .populate("test_id");
    return testResults || [];
  };
  createTestResult = async ({ data, userId }) => {
    let numberAnswerCorrect = 0;
    const test = await testEntity.findOne({ _id: data?.testId });
    if (!test) {
      const error = new Error("Không tìm thấy bài kiểm tra này!");
      error.statusCode = 404;
      throw error;
    }
    const questions = await questionEntity?.find({ test_id: test?._id });
    await Promise.all(
      questions?.map(async (value) => {
        const selectedOption = data?.selectedOptionIds[value?._id];
        const options = await optionEntity?.find({ question_id: value?._id });
        if (
          options?.some(
            (item) => item?._id == selectedOption && item?.is_correct
          )
        )
          numberAnswerCorrect = numberAnswerCorrect + 1;
      })
    );
    const score = Number(
      Math.floor((100 / questions?.length) * numberAnswerCorrect)
    );
    const newTestResult = await testResultEntity.create({
      test_id: data.testId,
      user_id: userId,
      started_at: data.startedAt,
      submitted_at: data.submittedAt,
      number_answer_correct: numberAnswerCorrect,
      score,
    });
    await newTestResult.populate("test_id");
    if (newTestResult.score >= newTestResult?.test_id?.pass_score) {
      const enrollment = await enrollmentEntity.findOne({
        course_id: newTestResult?.test_id?.course_id,
        user_id: userId,
      });
      if (!enrollment) {
        const error = new Error(
          "Không tìm thấy đơn ghi danh khóa học của người dùng này!"
        );
        error.statusCode = 404;
        throw error;
      }
      const newProgress = enrollment.progress_percent + 40;
      await enrollmentEntity.updateOne(
        {
          course_id: newTestResult?.test_id?.course_id,
          user_id: userId,
        },
        { progress_percent: newProgress }
      );
    }
    return newTestResult;
  };
}
