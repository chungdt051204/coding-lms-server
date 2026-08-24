import { RatingService } from "../services/ratingService.js";

export class RatingController {
  createRating = async (req, res) => {
    try {
      const payload = req.payload;
      const data = req.body;
      const result = await new RatingService().createRating({
        userId: payload.sub,
        data,
      });
      return res.status(201).json({
        message: "Tạo đánh giá thành công",
        data: result,
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getRatings = async (req, res) => {
    try {
      const params = req.query;
      const result = await new RatingService().getRatings({ params });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  hideOrShowComment = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await new RatingService().hideOrShowComment({
        ratingId: id,
      });
      return res.status(200).json({
        message: !result?.status
          ? "Ẩn bình luận thành công"
          : "Hiện bình luận thành công",
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
}
