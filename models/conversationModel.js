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
export default mongoose.model(
  "conversationEntity",
  conversationSchema,
  "Conversation"
);
