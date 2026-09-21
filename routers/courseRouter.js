import express from "express";
import cloudinary from "../configs/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Course",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage: storage });
export const courseRouter = express.Router();
import { CourseController } from "../controllers/courseController.js";
import { middleware } from "../middlewares/middleware.js";
const prefix = "";
courseRouter.get(
  `${prefix}/courses`,
  new CourseController().getApprovedCourses
);
courseRouter.get(
  `${prefix}/instructor/courses`,
  middleware.verifyToken,
  middleware.isInstructor,
  new CourseController().getCoursesByInstructor
);
courseRouter.get(
  `${prefix}/admin/courses`,
  middleware.verifyToken,
  middleware.isAdmin,
  new CourseController().getCoursesByAdmin
);
courseRouter.get(`${prefix}/course/:id`, new CourseController().getCourseById);
courseRouter.post(
  `${prefix}/instructor/course`,
  middleware.verifyToken,
  middleware.isInstructor,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  new CourseController().addCourse
);
courseRouter.put(
  `${prefix}/instructor/course/:id`,
  middleware.verifyToken,
  middleware.isInstructor,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  new CourseController().updateCourse
);
courseRouter.put(
  `${prefix}/instructor/course/:id/status`,
  middleware.verifyToken,
  middleware.isInstructor,
  new CourseController().submitOrUnSubmitCourse
);
courseRouter.put(
  `${prefix}/instructor/course/:id/action`,
  middleware.verifyToken,
  middleware.isInstructor,
  new CourseController().deleteOrRestoreCourse
);
courseRouter.put(
  `${prefix}/admin/course/:id/status`,
  middleware.verifyToken,
  middleware.isAdmin,
  new CourseController().approveOrRejectCourse
);
