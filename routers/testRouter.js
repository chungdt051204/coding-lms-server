import express from "express";
export const testRouter = express.Router();
import { TestController } from "../controllers/testController.js";
const prefix = "";
import { middleware } from "../middlewares/middleware.js";
testRouter.get(
  `${prefix}/instructor/tests`,
  middleware.verifyToken,
  middleware.isInstructor,
  new TestController().getTestsByInstructor
);
testRouter.get(`${prefix}/test/:id`, new TestController().getTestById);
testRouter.get(
  `${prefix}/course/:courseId/test`,
  middleware.verifyToken,
  new TestController().getTestByCourse
);
testRouter.post(
  `${prefix}/instructor/test/create`,
  middleware.verifyToken,
  middleware.isInstructor,
  new TestController().createTest
);
testRouter.delete(
  `${prefix}/instructor/test/:id`,
  middleware.verifyToken,
  middleware.isInstructor,
  new TestController().deleteTest
);
testRouter.put(
  `${prefix}/instructor/test/:id`,
  middleware.verifyToken,
  middleware.isInstructor,
  new TestController().updateTest
);
testRouter.put(
  `${prefix}/instructor/test/:id/status`,
  middleware.verifyToken,
  middleware.isInstructor,
  new TestController().activeTest
);
