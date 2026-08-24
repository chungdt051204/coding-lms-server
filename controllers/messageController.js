import { MessageService } from "../services/messageService.js";

export class MessageController {
  postMessage = async (req, res) => {
    try {
      const payload = req.payload;
      const data = req.body;
      const result = await new MessageService().postMessage({
        data,
        senderId: payload.sub,
      });
      return res
        .status(201)
        .json({ message: "Tạo tin nhắn thành công", data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  readAllMessagesByConversation = async (req, res) => {
    try {
      const { id } = req.params;
      await new MessageService().readAllMessagesInConversation({
        conversationId: id,
      });
      return res
        .status(200)
        .json({ message: "Cập nhật trạng thái tin nhắn thành công" });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
}
