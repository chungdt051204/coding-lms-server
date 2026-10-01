import mongoose from "mongoose";
const optionSchema = new mongoose.Schema(
  {
    question_id: {
      type: mongoose.Schema.ObjectId,
      ref: "questionEntity",
      required: true,
      index: true,
    },
    answer_content: {
      type: String,
      required: true,
    },
    is_correct: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("optionEntity", optionSchema, "Option");
