import dotenv from "dotenv";
dotenv.config();
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import userEntity from "../models/userModel.js";
import { RoleService } from "./roleService.js";
import { io } from "../script.js";
const saltRounds = 10;

export class AuthService {
  generateToken = ({ data }) => {
    let result = {};
    const payload = {
      sub: data._id,
    };
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    result.data = data;
    result.token = token;
    return result;
  };

  Register = async ({ data }) => {
    const existingEmail = await userEntity.findOne({
      email: data.email,
      login_method: "email thường",
    });
    if (existingEmail) {
      const error = new Error("Email này đã tồn tại!");
      error.statusCode = 409;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    if (data.role === undefined || !data.role) {
      const error = new Error("Vui lòng chọn vai trò!");
      error.statusCode = 422;
      throw error;
    }
    const role = await new RoleService().getRoleByName({ name: data.role });
    const newUser = await userEntity.create({
      full_name: data.fullName,
      email: data.email,
      password: hashedPassword,
      role_id: role._id,
    });
    if (role.role === "instructor")
      await userEntity.updateOne(
        { _id: newUser?._id },
        { verified_status: "NOT_VERIFIED" }
      );
    return newUser;
  };

  Login = async ({ data }) => {
    const existingUser = await userEntity
      .findOne({
        email: data.email,
        login_method: "email thường",
      })
      .populate("role_id");
    if (!existingUser) {
      const error = new Error("Tài khoản không tồn tại hoặc đã bị xóa!");
      error.statusCode = 404;
      throw error;
    }
    const isMatch = await bcrypt.compare(data.password, existingUser.password);
    if (!isMatch) {
      const error = new Error("Mật khẩu không chính xác!");
      error.statusCode = 401;
      throw error;
    }
    if (!existingUser?.status) {
      const error = new Error("Tài khoản này đã bị vô hiệu hóa!");
      error.statusCode = 403;
      throw error;
    }
    const token = this.generateToken({ data: existingUser })?.token;
    await userEntity.updateOne(
      { _id: existingUser?._id },
      { access_token: token }
    );
    io.to(existingUser?._id.toString()).emit("force-logout");
    return this.generateToken({ data: existingUser });
  };
  Logout = async ({ userId }) => {
    await userEntity.updateOne({ _id: userId }, { access_token: null });
  };
}
