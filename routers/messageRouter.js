import express from "express";
export const messageRouter = express.Router();
import { MessageController } from "../controllers/messageController.js";
import { middleware } from "../middlewares/middleware.js";
const prefix = "";
messageRouter.post(
  `${prefix}/message`,
  middleware.verifyToken,
  new MessageController().postMessage
);
messageRouter.put(
  `${prefix}/conversation/:id/messages`,
  middleware.verifyToken,
  middleware.isInstructor,
  new MessageController().readAllMessagesByConversation
);
