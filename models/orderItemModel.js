import mongoose from "mongoose";
const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.ObjectId,
      ref: "orderEntity",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.ObjectId,
      ref: "courseEntity",
      required: true,
    },
    course_name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    payment_option: {
      type: String,
      enum: ["PARTIAL", "FULL"],
      default: "FULL",
    },
    applied_amount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);
export default mongoose.model("orderItemEntity", orderItemSchema, "Order Item");
