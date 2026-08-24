import { StatisticsService } from "../services/statisticsService.js";

export class StatisticsController {
  getStatisticsByInstructor = async (req, res) => {
    try {
      const payload = req.payload;
      const result = await new StatisticsService().getStatisticsByInstructor({
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
  getStatisticsByAdmin = async (req, res) => {
    try {
      const result = await new StatisticsService().getStatisticsByAdmin();
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
}
