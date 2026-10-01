import mongoose from "mongoose";
const testResultSchema = new mongoose.Schema(
  {
    test_id: {
      type: mongoose.Schema.ObjectId,
      ref: "testEntity",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "userEntity",
      required: true,
    },
    started_at: {
      type: Date,
      required: true,
    },
    submitted_at: {
      type: Date,
      required: true,
    },
    number_answer_correct: {
      type: Number,
      min: 0,
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
testResultSchema.index({ course_id: 1, user_id: 1, createdAt: -1 });
export default mongoose.model(
  "testResultEntity",
  testResultSchema,
  "Test Result"
);
