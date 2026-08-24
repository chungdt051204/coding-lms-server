import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
const courseSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "userEntity",
      required: true,
    },
    category_id: {
      type: mongoose.Schema.ObjectId,
      ref: "categoryEntity",
      required: true,
    },
    course_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    level: {
      type: String,
      enum: ["Cơ bản", "Trung bình", "Nâng cao"],
      required: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    objectives: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    thumbnail_url: {
      type: String,
      required: true,
    },
    rating_star: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    is_free: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },
    is_visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
courseSchema.plugin(paginate);
export default mongoose.model("courseEntity", courseSchema, "Course");
