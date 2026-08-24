import express from "express";
export const statisticsRouter = express.Router();
import { StatisticsController } from "../controllers/statisticsController.js";
import { middleware } from "../middlewares/middleware.js";
const prefix = "";
statisticsRouter.get(
  `${prefix}/instructor/statistics`,
  middleware.verifyToken,
  middleware.isInstructor,
  new StatisticsController().getStatisticsByInstructor
);
statisticsRouter.get(
  `${prefix}/admin/statistics`,
  middleware.verifyToken,
  middleware.isAdmin,
  new StatisticsController().getStatisticsByAdmin
);
