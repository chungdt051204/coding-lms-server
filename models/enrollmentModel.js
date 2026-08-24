import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
const enrollmentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "userEntity",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.ObjectId,
      ref: "courseEntity",
      required: true,
    },
    access_level: {
      type: String,
      enum: ["LIMITED", "UNLIMITED"],
      required: true,
    },
    total_lessons: {
      type: Number,
      min: 0,
      required: true,
    },
    completed_lessons: {
      type: Number,
      min: 0,
      default: 0,
    },
    progress_percent: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);
enrollmentSchema.plugin(paginate);
export default mongoose.model(
  "enrollmentEntity",
  enrollmentSchema,
  "Enrollment"
);
