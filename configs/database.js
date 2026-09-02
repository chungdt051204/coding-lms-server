import mongoose from "mongoose";
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/lvtn");
    console.log("Kết nối thành công");
  } catch (error) {
    console.log("Lỗi kết nối database", { error: error.message });
    process.exit(1);
  }
};
export default connectDB;
