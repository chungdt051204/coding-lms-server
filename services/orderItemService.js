import orderItemEntity from "../models/orderItemModel.js";
import orderEntity from "../models/orderModel.js";

export class OrderItemService {
  addOrderItem = async ({ orderItem, orderId }) => {
    const newOrderItem = await orderItemEntity.create({
      order_id: orderId,
      course_id: orderItem?.courseId,
      course_name: orderItem?.courseName,
      price: orderItem?.price,
      payment_option: orderItem?.paymentOption,
    });
    return newOrderItem;
  };
  getOrderItemsByOrder = async ({ orderId }) => {
    const order = await orderEntity.findOne({ _id: orderId });
    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng!");
      error.statusCode = 404;
      throw error;
    }
    const orderItems = await orderItemEntity
      .find({ order_id: orderId })
      .populate("course_id");
    return orderItems || [];
  };
}
