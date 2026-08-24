import orderEntity from "../models/orderModel.js";
import orderItemEntity from "../models/orderItemModel.js";
export class RevenueService {
  getRevenueOfCourse = async ({ courseId }) => {
    let revenue = 0;
    const orders = await orderEntity.find({
      payment_status: { $in: ["PAID", "PARTIAL_PAID"] },
    });
    await Promise.all(
      orders?.map(async (value) => {
        const orderItems = await orderItemEntity.find({
          order_id: value._id,
          course_id: courseId,
        });
        orderItems?.forEach((item) => {
          revenue = revenue + item.applied_amount;
        });
      })
    );
    return revenue;
  };
}
