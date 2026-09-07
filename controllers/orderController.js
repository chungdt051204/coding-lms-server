import dotenv from "dotenv";
dotenv.config();
import { OrderService } from "../services/orderService.js";
import { OrderItemService } from "../services/orderItemService.js";

export class OrderController {
  checkout = async (req, res) => {
    try {
      const payload = req.payload;
      const { formData } = req.body;
      const result = await new OrderService().checkout({
        formData,
        userId: payload.sub,
      });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  processPayment = async (req, res) => {
    try {
      const payload = req.payload;
      const { orderId } = req.body;
      const result = await new OrderService().processPayment({
        orderId,
        userId: payload.sub,
      });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getResultZaloPayment = async (req, res) => {
    try {
      const params = req.query;
      const result = await new OrderService().getResultZaloPayment({ params });
      return res.redirect(
        `${process.env.URL_FRONTEND}/my-orders?status=${result.status}`
      );
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getOrders = async (req, res) => {
    try {
      const params = req.query;
      const result = await new OrderService().getOrders({ params });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getOrdersByUser = async (req, res) => {
    try {
      const payload = req.payload;
      const params = req.query;
      const result = await new OrderService().getOrdersByUser({
        userId: payload.sub,
        params,
      });
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
  getOrderById = async (req, res) => {
    try {
      const { id } = req.params;
      const item = await new OrderService().getOrderById({ orderId: id });
      const orderItems = await new OrderItemService().getOrderItemsByOrder({
        orderId: id,
      });
      const result = { item, orderItems };
      return res.status(200).json({ data: result });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống" });
    }
  };
}
