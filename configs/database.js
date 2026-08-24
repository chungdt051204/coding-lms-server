import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Kết nối thành công");
  } catch (error) {
    console.log("Lỗi kết nối database", { error: error.message });
    process.exit(1);
  }
};
export default connectDB;
