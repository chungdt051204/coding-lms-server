import express from "express";
export const cartItemRouter = express.Router();
import { CartItemController } from "../controllers/cartItemController.js";
import { middleware } from "../middlewares/middleware.js";
const prefix = "";
cartItemRouter.delete(
  `${prefix}/cartItem/:id`,
  middleware.verifyToken,
  new CartItemController().deleteCartItem
);
cartItemRouter.post(
  `${prefix}/cartItems`,
  middleware.verifyToken,
  new CartItemController().deleteCartItemsSelected
);
