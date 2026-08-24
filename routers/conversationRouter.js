import express from "express";
export const conversationRouter = express.Router();
import { ConversationController } from "../controllers/conversationController.js";
import { middleware } from "../middlewares/middleware.js";
const prefix = "";
conversationRouter.get(
  `${prefix}/user/conversations`,
  middleware.verifyToken,
  new ConversationController().getConversationByParticipantsAndCourse
);
conversationRouter.get(
  `${prefix}/instructor/conversations`,
  middleware.verifyToken,
  middleware.isInstructor,
  new ConversationController().getConversationsByInstructor
);
conversationRouter.get(
  `${prefix}/instructor/conversation/:id`,
  middleware.verifyToken,
  middleware.isInstructor,
  new ConversationController().getConversationById
);
