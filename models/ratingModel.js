import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
const ratingSchema = new mongoose.Schema(
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
    rating_star: {
      type: Number,
      min: 0,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
ratingSchema.plugin(paginate);
export default mongoose.model("ratingEntity", ratingSchema, "Rating");
