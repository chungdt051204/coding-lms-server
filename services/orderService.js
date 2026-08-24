import dotenv, { populate } from "dotenv";
dotenv.config();
import orderEntity from "../models/orderModel.js";
import orderItemEntity from "../models/orderItemModel.js";
import enrollmentEntity from "../models/enrollmentModel.js";
import { OrderItemService } from "../services/orderItemService.js";
import { CartItemService } from "../services/cartItemService.js";
import { EnrollmentService } from "../services/enrollmentService.js";
import axios from "axios";
import CryptoJS from "crypto-js";
import moment from "moment";
import { NotificationService } from "./notificationService.js";
import roleEntity from "../models/roleModel.js";
import userEntity from "../models/userModel.js";

const config = {
  appid: process.env.APP_ID,
  key1: process.env.KEY1,
  key2: process.env.KEY2,
  endpoint: process.env.ENDPOINT,
};
export class OrderService {
  checkout = async ({ formData, userId }) => {
    const newOrder = await this.createOrder({ formData });
    const orderItemsPromise = formData.orderItems?.map(async (value) => {
      return await new OrderItemService().addOrderItem({
        orderItem: value,
        orderId: newOrder._id,
      });
    });
    await Promise.all(orderItemsPromise);
    const appTransId = moment().format("YYMMDD") + "_" + Date.now(); //ZaloPay yêu cầu yyMMdd_
    const embedData = {
      redirecturl: `${process.env.URL_BACKEND}/payment/zalopay/result`,
    };
    const items = formData.orderItems?.map((value) => {
      return { id: value.courseId };
    });
    const orderData = {
      app_id: config.appid,
      app_user: userId,
      app_time: Date.now(),
      amount: formData.appliedAmount,
      app_trans_id: appTransId,
      embed_data: JSON.stringify(embedData),
      item: JSON.stringify(items),
      description: `Thanh toan don hang ${newOrder._id}`,
    };
    const data =
      orderData.app_id +
      "|" +
      orderData.app_trans_id +
      "|" +
      orderData.app_user +
      "|" +
      orderData.amount +
      "|" +
      orderData.app_time +
      "|" +
      orderData.embed_data +
      "|" +
      orderData.item; //Thứ tự appId, appTransId, appUser, amount, appTime, embedData, item
    orderData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    const response = await axios.post(
      config.endpoint,
      new URLSearchParams(orderData).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    await orderEntity.updateOne(
      { _id: newOrder?._id },
      { transaction_id: appTransId }
    );
    return response.data;
  };
  createOrder = async ({ formData }) => {
    const newOrder = await orderEntity.create({
      user_id: formData.userId,
      full_name: formData.fullName,
      email: formData.email,
      cart_item_ids: formData.cartItemIds,
      payment_method: formData.paymentMethod,
      total_amount: formData.totalAmount,
    });
    return newOrder;
  };
  processPayment = async ({ orderId, userId }) => {
    const order = await orderEntity.findOne({ _id: orderId });
    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng!");
      error.statusCode = 404;
      throw error;
    }
    const remainingAmount = order.total_amount - order.applied_amount;
    const orderItems = await orderItemEntity.find({ order_id: orderId });
    const appTransId = moment().format("YYMMDD") + "_" + Date.now(); //ZaloPay yêu cầu yyMMdd_
    const embedData = {
      redirecturl: `${process.env.URL_BACKEND}/payment/zalopay/result`,
    };
    const items = orderItems?.map((value) => {
      return { id: value._id };
    });
    const orderData = {
      app_id: config.appid,
      app_user: userId,
      app_time: Date.now(),
      amount: remainingAmount,
      app_trans_id: appTransId,
      embed_data: JSON.stringify(embedData),
      item: JSON.stringify(items),
      description: `Thanh toan don hang ${order._id}`,
    };
    const data =
      orderData.app_id +
      "|" +
      orderData.app_trans_id +
      "|" +
      orderData.app_user +
      "|" +
      orderData.amount +
      "|" +
      orderData.app_time +
      "|" +
      orderData.embed_data +
      "|" +
      orderData.item; //Thứ tự appId, appTransId, appUser, amount, appTime, embedData, item
    orderData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    const response = await axios.post(
      config.endpoint,
      new URLSearchParams(orderData).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    await orderEntity.updateOne(
      { _id: order._id },
      { transaction_id: appTransId }
    );
    return response.data;
  };
  getResultZaloPayment = async ({ params }) => {
    //Tạo chuỗi băm
    let data =
      params.appid +
      "|" +
      params.apptransid +
      "|" +
      params.pmcid +
      "|" +
      params.bankcode +
      "|" +
      params.amount +
      "|" +
      params.discountamount +
      "|" +
      params.status;
    let checksum = CryptoJS.HmacSHA256(data, config.key2).toString(); //Tạo chuỗi mã hóa
    console.log(checksum, params.checksum, checksum === params.checksum);
    //Kiểm tra xem checksum vừa tạo có bằng checksum zalopay gửi về
    if (checksum !== params.checksum) {
      const error = new Error("Xác thực thất bại!");
      error.statusCode = 401;
      throw error;
    }
    const order = await orderEntity.findOne({
      transaction_id: params.apptransid,
    });
    if (!order) {
      const error = new Error("Đơn hàng không tồn tại!");
      error.statusCode = 404;
      throw error;
    }
    const currentStatus = order.payment_status;
    let paymentStatus = "";
    const appliedAmount =
      currentStatus == "PARTIAL_PAID"
        ? order.applied_amount + Number(params.amount)
        : Number(params.amount);
    const notificationService = new NotificationService();
    if (params.status != 1) {
      await orderEntity.updateOne(
        { _id: order._id },
        { payment_status: "FAILED" }
      );
      await notificationService.createNotification({
        userId: order.user_id,
        type: "PAYMENT",
        title: "Thanh toán thất bại",
        message: `Thanh toán cho đơn hàng ${order._id} không thành công`,
      });
      return { status: "FAILED" };
    }
    if (params.status != 1 && currentStatus == "PARTIAL_PAID")
      return { status: "PARTIAL_PAID" };
    const orderItems = await orderItemEntity
      .find({ order_id: order?._id })
      .populate("course_id");
    if (currentStatus == "PENDING") {
      paymentStatus = orderItems?.some(
        (value) => value.payment_option == "PARTIAL"
      )
        ? "PARTIAL_PAID"
        : "PAID";
      await new CartItemService().deletedCartItemsSelected({
        cartItemIds: order?.cart_item_ids,
      });
    } else if (currentStatus == "PARTIAL_PAID") paymentStatus = "PAID";
    const result = await orderEntity.findOneAndUpdate(
      { _id: order._id },
      { payment_status: paymentStatus, applied_amount: appliedAmount },
      { returnDocument: "after" }
    );
    const adminRole = await roleEntity.findOne({ role: "admin" });
    const admin = await userEntity.findOne({ role_id: adminRole?._id });
    let totalAdminProfit = 0;
    await Promise.all(
      orderItems?.map(async (value) => {
        const result = await orderItemEntity.findOneAndUpdate(
          { _id: value._id },
          {
            applied_amount:
              value.payment_option === "FULL"
                ? value.price
                : paymentStatus === "PAID"
                ? value.price
                : (value.price * 50) / 100,
          },
          {
            returnDocument: "after",
          }
        );
        const adminProfit = (result.applied_amount * 20) / 100;
        totalAdminProfit = totalAdminProfit + adminProfit;
        await userEntity.updateOne(
          { _id: value?.course_id?.user_id },
          { $inc: { balance: (result.applied_amount * 80) / 100 } }
        );
      })
    );
    await notificationService.createNotification({
      userId: order.user_id,
      type: "PAYMENT",
      title: "Thanh toán thành công",
      message: `Đơn hàng ${
        order._id
      } đã được thanh toán thành công với hình thức ${
        result.payment_status == "PAID"
          ? "thanh toán toàn bộ"
          : "thanh toán một phần"
      }`,
    });
    const enrollmentService = new EnrollmentService();
    await Promise.all(
      orderItems?.map(async (value) => {
        const accessLevel =
          result.payment_status == "PAID" || value.payment_option == "FULL"
            ? "UNLIMITED"
            : "LIMITED";
        const enrollment = await enrollmentEntity.findOne({
          course_id: value?.course_id?._id,
          user_id: order.user_id,
        });
        if (enrollment) {
          await enrollmentEntity.updateOne(
            { _id: enrollment._id },
            { access_level: accessLevel }
          );
          if (enrollment.access_level == "LIMITED")
            await notificationService.createNotification({
              userId: order.user_id,
              type: "ENROLLMENT",
              title: "Mở khóa toàn bộ khóa học",
              message: `Khóa học ${value.course_name} đã mở khóa toàn bộ quyền truy cập`,
            });
        } else {
          await enrollmentService.createEnrollment({
            courseId: value?.course_id?._id,
            userId: order.user_id,
            accessLevel,
          });
          await notificationService.createNotification({
            userId: order.user_id,
            type: "ENROLLMENT",
            title: "Đăng ký khóa học thành công",
            message: `Khóa học ${
              value.course_name
            } đã được đăng ký thành công với quyền truy cập ${
              accessLevel == "UNLIMITED" ? "không giới hạn" : "có giới hạn"
            }`,
          });
        }
      })
    );
    await userEntity.updateOne(
      { _id: admin?._id },
      { $inc: { balance: totalAdminProfit } }
    );
    return { status: paymentStatus };
  };
  getOrders = async ({ params }) => {
    const options = {
      page: params.page,
      limit: params.limit,
      sort: { createdAt: -1 },
      populate: ["user_id"],
    };
    let query = {};
    if (params?.status !== undefined) {
      query.payment_status = params.status;
    }
    const orders = await orderEntity.paginate(query, options);
    return { items: orders?.docs, totalPages: orders?.totalPages };
  };
  getOrdersByUser = async ({ userId, params }) => {
    const options = {
      page: params.page,
      limit: params.limit,
      sort: { createdAt: -1 },
    };
    let query = { user_id: userId };
    if (params?.status !== undefined) {
      query.payment_status = params.status;
    }
    const orders = await orderEntity.paginate(query, options);
    return { orders: orders?.docs, totalPages: orders?.totalPages };
  };
  getOrderById = async ({ orderId }) => {
    const order = await orderEntity.findOne({ _id: orderId });
    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng!");
      error.statusCode = 404;
      throw error;
    }
    return order;
  };
}
