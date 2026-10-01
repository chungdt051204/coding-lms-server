import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "userEntity",
      required: true,
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
notificationSchema.index({ user_id: 1, createdAt: -1 });
notificationSchema.index({ user_id: 1, is_read: 1 });
export default mongoose.model(
  "notificationEntity",
  notificationSchema,
  "Notification"
);
