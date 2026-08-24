import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "userEntity",
    },
    type: {
      type: String,
      enum: ["PAYMENT", "ENROLLMENT", "COMMENT", "ACCOUNT", "COURSE"],
      required: true,
    },
    title: {
      type: String,
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
export default mongoose.model(
  "notificationEntity",
  notificationSchema,
  "Notification"
);
