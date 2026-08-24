import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    conservation_id: {
      type: mongoose.Schema.ObjectId,
      ref: "conservationEntity",
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.ObjectId,
      ref: "userEntity",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("messageEntity", messageSchema, "Message");
