import mongoose from "mongoose";
const lessonProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "userEntity",
      required: true,
    },
    lesson_id: {
      type: mongoose.Schema.ObjectId,
      ref: "lessonEntity",
      required: true,
    },
    current_time: {
      type: Number,
      min: 0,
      default: 0,
    },
    is_completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
lessonProgressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });
export default mongoose.model(
  "lessonProgressEntity",
  lessonProgressSchema,
  "Lesson Progress"
);
