import { QuestionService } from "../services/questionService.js";
import { TestService } from "../services/testService.js";

export class TestController {
  getTestsByInstructor = async (req, res) => {
    try {
      const payload = req.payload;
      const params = req.query;
      console.log(params);
      const result = await new TestService().getTestsByInstructor({
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
  getTestById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await new TestService().getTestById({ testId: id });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getTestByCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const result = await new TestService().getTestByCourse({ courseId });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  createTest = async (req, res) => {
    try {
      const { formData } = req.body;
      const questions = formData.questions.map((value) => {
        return {
          question: {
            questionContent: value.questionContent,
            order: value.order,
          },
          options: value.options,
        };
      });
      const result = await new TestService().createTest({ formData });
      if (questions.length > 0) {
        await new QuestionService().addQuestion({
          testId: result._id,
          questions,
        });
      }
      return res
        .status(200)
        .json({ message: "Tạo bài kiểm tra thành công", data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  deleteTest = async (req, res) => {
    try {
      const { id } = req.params;
      await new TestService().deleteTest({ testId: id });
      return res.status(200).json({ message: "Xóa bài kiểm tra thành công" });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  updateTest = async (req, res) => {
    try {
      const { id } = req.params;
      const { formData } = req.body;
      const questions = formData.questions;
      let newQuestions = [];
      let existingQuestions = [];
      questions?.forEach((value) => {
        if (!value.questionId)
          newQuestions.push({
            question: {
              questionContent: value.questionContent,
              order: value.order,
            },
            options: value.options,
          });
        else
          existingQuestions.push({
            question: {
              questionId: value.questionId,
              questionContent: value.questionContent,
              order: value.order,
            },
            options: value.options,
          });
      });
      console.log(newQuestions);
      console.log(existingQuestions);
      const result = await new TestService().updateTest({
        testId: id,
        formData,
      });
      if (existingQuestions.length > 0)
        await new QuestionService().updateQuestions({
          arrayQuestion: existingQuestions,
        });
      if (newQuestions.length > 0)
        await new QuestionService().addQuestion({
          testId: result.test._id,
          questions: newQuestions,
        });
      return res
        .status(200)
        .json({ message: "Cập nhật bài kiểm tra thành công", data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  activeTest = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await new TestService().activeTest({ testId: id });
      return res
        .status(200)
        .json({ message: "Kích hoạt bài kiểm tra thành công", data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
}
