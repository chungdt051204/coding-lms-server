import mongoose from "mongoose";
const cartItemSchema = new mongoose.Schema(
  {
    cart_id: {
      type: mongoose.Schema.ObjectId,
      ref: "cartEntity",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.ObjectId,
      ref: "courseEntity",
      required: true,
    },
  },
  { timestamps: true }
);
cartItemSchema.index({ cart_id: 1, course_id: 1 }, { unique: true });
export default mongoose.model("cartItemEntity", cartItemSchema, "Cart Item");
