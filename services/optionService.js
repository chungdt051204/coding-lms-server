import optionEntity from "../models/optionModel.js";
export class OptionService {
  getOptionsByQuestion = async ({ questionId }) => {
    const options = await optionEntity
      .find({ question_id: questionId })
      .select("question_id answer_content");
    return options || [];
  };
  addOption = async ({ questionId, options }) => {
    const optionPromise = options?.map((value) => {
      return optionEntity.create({
        question_id: questionId,
        answer_content: value.answerContent,
        is_correct: value.isCorrect,
      });
    });
    await Promise.all(optionPromise);
  };
  deleteOptions = async ({ questions }) => {
    const optionPromise = questions?.map((value) => {
      return optionEntity.deleteMany({ question_id: value._id });
    });
    await Promise.all(optionPromise);
  };
  updateOptions = async ({ arrayOption }) => {
    const optionPromise = arrayOption.map(async (value) => {
      await optionEntity.updateOne(
        { _id: value.optionId },
        { answer_content: value.answerContent, is_correct: value.isCorrect }
      );
    });
    await Promise.all(optionPromise);
  };
}
