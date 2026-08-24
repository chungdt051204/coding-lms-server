import ratingEntity from "../models/ratingModel.js";
import courseEntity from "../models/courseModel.js";
export class RatingService {
  createRating = async ({ userId, data }) => {
    const course = await courseEntity.findOne({
      _id: data.courseId,
    });
    if (!course) {
      const error = new Error("Không tìm thấy khóa học để đánh giá");
      error.statusCode = 404;
      throw error;
    }
    const newRating = await ratingEntity.create({
      user_id: userId,
      course_id: data.courseId,
      rating_star: data.ratingStar,
      comment: data.comment,
    });
    await newRating.populate("user_id");
    let totalStar = 0;
    let averageStar = 0;
    const rating = await ratingEntity.find({ course_id: data.courseId });
    rating?.forEach((value) => {
      totalStar = totalStar + value.rating_star;
    });
    averageStar = Number((totalStar / rating?.length).toFixed(1));
    await courseEntity.updateOne(
      { _id: data.courseId },
      { rating_star: averageStar }
    );
    return newRating;
  };
  getRatings = async ({ params }) => {
    const options = {
      page: params.page,
      limit: params.limit,
      sort: { createdAt: -1 },
      populate: ["course_id", "user_id"],
    };
    let query = {};
    if (params?.status !== undefined)
      query.status = params.status == "active" ? true : false;
    const ratings = await ratingEntity.paginate(query, options);
    return { items: ratings?.docs, totalPages: ratings?.totalPages };
  };
  hideOrShowComment = async ({ ratingId }) => {
    const rating = await ratingEntity.findOne({ _id: ratingId });
    if (!rating) {
      const error = new Error("Không tìm thấy đánh giá để ẩn hiện bình luận!");
      error.statusCode = 404;
      throw error;
    }
    const currentStatus = rating?.status;
    await ratingEntity.updateOne(
      { _id: ratingId },
      { status: currentStatus ? false : true }
    );
  };
}
