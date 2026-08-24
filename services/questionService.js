import questionEntity from "../models/questionModel.js";
import optionEntity from "../models/optionModel.js";
import testEntity from "../models/testModel.js";
import { OptionService } from "./optionService.js";
import { util } from "../helper/util.js";
export class QuestionService {
  getQuestionsByTest = async ({ testId }) => {
    const test = await testEntity.findOne({ _id: testId });
    if (!test) {
      const error = new Error("Bài kiểm tra không tồn tại!");
      error.statusCode = 404;
      throw error;
    }
    const questions = await questionEntity
      .find({ test_id: testId })
      .sort({ order: 1 });
    const arrayQuestion = await Promise.all(
      questions?.map(async (value) => {
        const options = await new OptionService().getOptionsByQuestion({
          questionId: value._id,
        });
        const shuffleArray = util.shuffleArray({ array: options });
        return {
          question: value,
          options: shuffleArray,
        };
      })
    );
    return arrayQuestion || [];
  };
  addQuestion = async ({ testId, questions }) => {
    const questionPromise = questions?.map(async (value) => {
      const newQuestion = await questionEntity.create({
        test_id: testId,
        question_content: value.question.questionContent,
        order: value.question.order,
      });
      await new OptionService().addOption({
        questionId: newQuestion._id,
        options: value.options,
      });
    });
    await Promise.all(questionPromise);
  };
  deleteQuestions = async ({ testId }) => {
    await questionEntity.deleteMany({ test_id: testId });
  };
  deleteQuestion = async ({ questionId }) => {
    const question = await questionEntity.findOne({ _id: questionId });
    if (!question) {
      const error = new Error("Không tìm thấy câu hỏi để xóa");
      error.statusCode = 404;
      throw error;
    }
    await questionEntity.deleteOne({ _id: questionId });
    await optionEntity.deleteMany({ question_id: questionId });
  };
  updateQuestions = async ({ arrayQuestion }) => {
    const questionPromise = arrayQuestion.map(async (value) => {
      await questionEntity.updateOne(
        { _id: value.question.questionId },
        {
          question_content: value.question.questionContent,
          order: value.question.order,
        }
      );
      await new OptionService().updateOptions({ arrayOption: value.options });
    });
    await Promise.all(questionPromise);
  };
}
