import { ConversationService } from "../services/conversationService.js";
export class ConversationController {
  getConversationByParticipantsAndCourse = async (req, res) => {
    try {
      const payload = req.payload;
      const query = req.query;
      const result =
        await new ConversationService().getConversationByParticipantsAndCourse({
          query,
          userId: payload.sub,
        });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getConversationsByInstructor = async (req, res) => {
    try {
      const payload = req.payload;
      const result =
        await new ConversationService().getConversationsByInstructor({
          instructorId: payload.sub,
        });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getConversationById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await new ConversationService().getConversationById({
        conversationId: id,
      });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
}
