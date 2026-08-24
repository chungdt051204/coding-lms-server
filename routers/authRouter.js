import express from "express";
export const authRouter = express.Router();
import { AuthController } from "../controllers/authController.js";
import { middleware } from "../middlewares/middleware.js";
import { limiter } from "../middlewares/rateLimit.js";
const prefix = "";
authRouter.get(`${prefix}/auth/google`, new AuthController().loginGoogle);
authRouter.get(
  `${prefix}/auth/google/callback`,
  new AuthController().getGoogleCallback
);
authRouter.post(
  `${prefix}/auth/register`,
  limiter,
  new AuthController().Register
);
authRouter.post(`${prefix}/auth/login`, limiter, new AuthController().Login);
authRouter.post(
  `${prefix}/auth/logout`,
  middleware.verifyToken,
  new AuthController().Logout
);
