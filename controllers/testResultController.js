import { TestResultService } from "../services/testResultService.js";

export class TestResultController {
  getTestResultById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await new TestResultService().getTestResultById({
        testResultId: id,
      });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getTestResultsByTest = async (req, res) => {
    try {
      const payload = req.payload;
      const { testId } = req.params;
      const result = await new TestResultService().getTestResultsByTest({
        testId,
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
  createTestResult = async (req, res) => {
    try {
      const payload = req.payload;
      const { data } = req.body;
      const result = await new TestResultService().createTestResult({
        data,
        userId: payload.sub,
      });
      return res
        .status(201)
        .json({ message: "Tạo kết quả kiểm tra thành công", data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
}
