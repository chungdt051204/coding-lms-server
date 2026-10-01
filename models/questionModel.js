import mongoose from "mongoose";
const questionSchema = new mongoose.Schema(
  {
    test_id: {
      type: mongoose.Schema.ObjectId,
      ref: "testEntity",
      required: true,
    },
    question_content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      min: 1,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
questionSchema.index({ test_id: 1 });
export default mongoose.model("questionEntity", questionSchema, "Question");
