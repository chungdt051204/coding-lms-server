import express from "express";
export const orderRouter = express.Router();
import { OrderController } from "../controllers/orderController.js";
const prefix = "";
import { middleware } from "../middlewares/middleware.js";
orderRouter.post(
  `${prefix}/checkout`,
  middleware.verifyToken,
  new OrderController().checkout
);
orderRouter.post(
  `${prefix}/process-payment`,
  middleware.verifyToken,
  new OrderController().processPayment
);
orderRouter.get(
  `${prefix}/admin/orders`,
  middleware.verifyToken,
  middleware.isAdmin,
  new OrderController().getOrders
);
orderRouter.get(
  `${prefix}/payment/zalopay/result`,
  new OrderController().getResultZaloPayment
);
orderRouter.get(
  `${prefix}/user/orders`,
  middleware.verifyToken,
  new OrderController().getOrdersByUser
);
orderRouter.get(
  `${prefix}/order/:id`,
  middleware.verifyToken,
  new OrderController().getOrderById
);
