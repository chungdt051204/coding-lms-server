import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "userEntity",
      required: true,
    },
    instructor_id: {
      type: mongoose.Schema.ObjectId,
      ref: "userEntity",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.ObjectId,
      ref: "courseEntity",
      required: true,
    },
    newest_message_id: {
      type: mongoose.Schema.ObjectId,
      ref: "messageEntity",
    },
  },
  {
    timestamps: true,
  }
);
conversationSchema.index({ user_id: 1, course_id: 1 }, { unique: true });
conversationSchema.index({ instructor_id: 1, updatedAt: -1 }, { unique: true });
export default mongoose.model(
  "conversationEntity",
  conversationSchema,
  "Conversation"
);
