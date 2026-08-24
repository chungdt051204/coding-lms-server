import express from "express";
export const aiRouter = express.Router();
import { AiController } from "../controllers/aiController.js";
import { middleware } from "../middlewares/middleware.js";
const prefix = "";
aiRouter.post(
  `${prefix}/chatbot-ai`,
  middleware.verifyToken,
  new AiController().sendMessage
);
