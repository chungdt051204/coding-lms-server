import express from "express";
export const testResultRouter = express.Router();
import { TestResultController } from "../controllers/testResultController.js";
import { middleware } from "../middlewares/middleware.js";
const prefix = "";
testResultRouter.get(
  `${prefix}/test-result/:id`,
  middleware.verifyToken,
  new TestResultController().getTestResultById
);
testResultRouter.get(
  `${prefix}/test/:testId/test-result`,
  middleware.verifyToken,
  new TestResultController().getTestResultsByTest
);
testResultRouter.post(
  `${prefix}/test-result`,
  middleware.verifyToken,
  new TestResultController().createTestResult
);
