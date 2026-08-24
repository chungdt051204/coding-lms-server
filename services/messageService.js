import messageEntity from "../models/messageModel.js";
import conversationEntity from "../models/conversationModel.js";
import { ConversationService } from "./conversationService.js";
export class MessageService {
  postMessage = async ({ data }) => {
    let conversation = await conversationEntity.findOne({
      user_id: data.userId,
      instructor_id: data.instructorId,
      course_id: data.courseId,
    });
    if (!conversation)
      conversation = await new ConversationService().createConversation({
        data,
      });
    const newMessage = await messageEntity.create({
      conservation_id: conversation?._id,
      sender_id: data.senderId,
      message: data.message,
    });
    await newMessage.populate("sender_id");
    await conversationEntity.updateOne(
      { _id: conversation?._id },
      { newest_message_id: newMessage?._id }
    );
    return { newMessage, conversationId: conversation?._id };
  };
  getMessageByConversation = async ({ conversationId }) => {
    const messages = await messageEntity
      .find({
        conservation_id: conversationId,
      })
      .populate("sender_id");
    return messages || [];
  };
  readAllMessagesInConversation = async ({ conversationId }) => {
    const conversation = await conversationEntity.findOne({
      _id: conversationId,
    });
    if (!conversation) {
      const error = new Error("Không tìm thấy cuộc hội thoại này!");
      error.statusCode = 404;
      throw error;
    }
    await messageEntity.updateMany(
      { conservation_id: conversation?._id },
      { is_read: true }
    );
  };
}
