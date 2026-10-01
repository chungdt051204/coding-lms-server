import express from "express";
export const enrollmentRouter = express.Router();
import { EnrollmentController } from "../controllers/enrollmentController.js";
import { middleware } from "../middlewares/middleware.js";
const prefix = "";
enrollmentRouter.post(
  `${prefix}/enrollment`,
  middleware.verifyToken,
  new EnrollmentController().createEnrollment
);
enrollmentRouter.get(
  `${prefix}/user/enrollments`,
  middleware.verifyToken,
  new EnrollmentController().getEnrollmentsByUser
);
