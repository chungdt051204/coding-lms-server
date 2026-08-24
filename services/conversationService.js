import conversationEntity from "../models/conversationModel.js";
import { MessageService } from "./messageService.js";
import userEntity from "../models/userModel.js";
import messageEntity from "../models/messageModel.js";
import roleEntity from "../models/roleModel.js";

export class ConversationService {
  createConversation = async ({ data }) => {
    const newConservation = await conversationEntity.create({
      user_id: data.userId,
      instructor_id: data.instructorId,
      course_id: data.courseId,
    });
    (
      await (
        await newConservation.populate("user_id")
      ).populate("instructor_id")
    ).populate("course_id");
    return newConservation;
  };
  getConversationByParticipantsAndCourse = async ({ query, userId }) => {
    const conversation = await conversationEntity.findOne({
      user_id: userId,
      instructor_id: query.instructorId,
      course_id: query.courseId,
    });
    if (!conversation) {
      const error = new Error("Không tìm thấy cuộc hội thoại này!");
      error.statusCode = 404;
      throw error;
    }
    const messages = await new MessageService().getMessageByConversation({
      conversationId: conversation._id,
    });
    return { item: conversation, messages };
  };
  getConversationsByInstructor = async ({ instructorId }) => {
    const roleUser = await roleEntity.findOne({ role: "user" });
    const instructor = await userEntity.find({ _id: instructorId });
    if (!instructor) {
      const error = new Error("Không tìm thấy tài khoản giảng viên này!");
      error.statusCode = 404;
      throw error;
    }
    const conversations = await conversationEntity
      .find({ instructor_id: instructorId })
      .sort({ createdAt: -1 })
      .populate("user_id")
      .populate("course_id")
      .populate("newest_message_id")
      .populate({ path: "newest_message_id", populate: "sender_id" });
    let totalUnreadMessages = 0;
    const arrayConversation = await Promise.all(
      conversations?.map(async (value) => {
        const messages = await messageEntity
          .find({
            conservation_id: value._id,
            is_read: false,
          })
          .populate("sender_id");
        const unreadMessages = messages?.filter(
          (value) =>
            value?.sender_id?.role_id.toString() == roleUser._id.toString()
        );
        totalUnreadMessages = totalUnreadMessages + unreadMessages?.length;
        return {
          item: value,
          unreadMessages: unreadMessages?.length,
        };
      })
    );
    return { arrayConversation, totalUnreadMessages };
  };
  getConversationById = async ({ conversationId }) => {
    const conversation = await conversationEntity
      .findOne({
        _id: conversationId,
      })
      .populate("course_id")
      .populate("user_id");
    if (!conversation) {
      const error = new Error("Không tìm thấy cuộc hội thoại này!");
      error.statusCode = 404;
      throw error;
    }
    const messages = await new MessageService().getMessageByConversation({
      conversationId: conversation?._id,
    });
    return { item: conversation, messages };
  };
}
