import mongoose from "mongoose";
const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "userEntity",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("cartEntity", cartSchema, "Cart");
