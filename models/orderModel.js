import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "userEntity",
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    cart_item_ids: {
      type: [String],
      required: true,
    },
    payment_method: {
      type: String,
      enum: ["ZALOPAY", "MOMO"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["PENDING", "PARTIAL_PAID", "PAID", "FAILED"],
      default: "PENDING",
    },
    total_amount: {
      type: Number,
      min: 0,
      required: true,
    },
    applied_amount: {
      type: Number,
      min: 0,
      default: 0,
    },
    transaction_id: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
orderSchema.plugin(paginate);
export default mongoose.model("orderEntity", orderSchema, "Order");
