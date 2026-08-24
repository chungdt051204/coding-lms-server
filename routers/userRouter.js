import express from "express";
export const userRouter = express.Router();
import { UserController } from "../controllers/userController.js";
import { middleware } from "../middlewares/middleware.js";
import cloudinary from "../configs/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "User",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage: storage });
const prefix = "";
userRouter.get(
  `${prefix}/me`,
  middleware.verifyToken,
  new UserController().getUserProfile
);
userRouter.get(
  `${prefix}/admin/instructors`,
  middleware.verifyToken,
  middleware.isAdmin,
  new UserController().getInstructors
);
userRouter.get(
  `${prefix}/admin/users`,
  middleware.verifyToken,
  middleware.isAdmin,
  new UserController().getUsers
);
userRouter.get(
  `${prefix}/admin/instructor/:id`,
  middleware.verifyToken,
  middleware.isAdmin,
  new UserController().getInstructorById
);
userRouter.get(
  `${prefix}/admin/user/:id`,
  middleware.verifyToken,
  middleware.isAdmin,
  new UserController().getUserById
);
userRouter.get(
  `${prefix}/instructor/students`,
  middleware.verifyToken,
  middleware.isInstructor,
  new UserController().getStudentsByInstructor
);
userRouter.get(
  `${prefix}/instructor/student/:id`,
  middleware.verifyToken,
  middleware.isInstructor,
  new UserController().getStudentById
);
userRouter.put(
  `${prefix}/instructor/verification/send`,
  middleware.verifyToken,
  middleware.isInstructor,
  upload.fields([
    { name: "frontIdCard", maxCount: 1 },
    { name: "backIdCard", maxCount: 1 },
    { name: "degreeCertificate", maxCount: 1 },
  ]),
  new UserController().sendRequestVerification
);
userRouter.put(
  `${prefix}/instructor/verification/cancel`,
  middleware.verifyToken,
  middleware.isInstructor,
  new UserController().cancelRequestVerification
);
userRouter.put(
  `${prefix}/admin/instructor/:id`,
  middleware.verifyToken,
  middleware.isAdmin,
  new UserController().approvedOrRejectedInstructor
);
userRouter.put(
  `${prefix}/me/avatar`,
  middleware.verifyToken,
  upload.single("avatar"),
  new UserController().updateAvatar
);
userRouter.put(
  `${prefix}/me/profile`,
  middleware.verifyToken,
  new UserController().updateProfile
);
userRouter.put(
  `${prefix}/me/password`,
  middleware.verifyToken,
  new UserController().changePassword
);
userRouter.put(
  `${prefix}/admin/user/:id/status`,
  middleware.verifyToken,
  middleware.isAdmin,
  new UserController().updateStatusUser
);
userRouter.put(
  `${prefix}/admin/instructor/:id/info`,
  middleware.verifyToken,
  middleware.isAdmin,
  new UserController().updateInstructorInfo
);
