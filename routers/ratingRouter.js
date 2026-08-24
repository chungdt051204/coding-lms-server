import express from "express";
export const ratingRouter = express.Router();
import { RatingController } from "../controllers/ratingController.js";
const prefix = "";
import { middleware } from "../middlewares/middleware.js";
ratingRouter.post(
  `${prefix}/rating`,
  middleware.verifyToken,
  new RatingController().createRating
);
ratingRouter.get(
  `${prefix}/admin/ratings`,
  middleware.verifyToken,
  middleware.isAdmin,
  new RatingController().getRatings
);
ratingRouter.put(
  `${prefix}/admin/rating/:id`,
  middleware.verifyToken,
  middleware.isAdmin,
  new RatingController().hideOrShowComment
);
