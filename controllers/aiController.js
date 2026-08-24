import { AiService } from "../services/aiService.js";
export class AiController {
  sendMessage = async (req, res) => {
    try {
      const { input } = req.body;
      const payload = req.payload;
      const result = await new AiService().sendMessage({
        input,
        userId: payload.sub,
      });
      console.log(result);
      return res.status(200).json(result);
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống!" });
    }
  };
}
