import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import { validateForm } from "../helper/validateForm.js";
import { AuthService } from "../services/authService.js";
import userEntity from "../models/userModel.js";
import { io } from "../script.js";

export class AuthController {
  loginGoogle = passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  });

  getGoogleCallback = [
    passport.authenticate("google", {
      failureRedirect: "/login",
      session: false,
    }),
    async (req, res) => {
      const user = req.user;
      const result = await new AuthService().generateToken({ data: user });
      await userEntity.updateOne(
        { _id: user?._id },
        { access_token: result?.token }
      );
      io.to(user?._id.toString()).emit("force-logout");
      return res.redirect(`${process.env.URL_FRONTEND}?token=${result.token}`);
    },
  ];

  Register = async (req, res) => {
    try {
      const data = req.body;
      if (validateForm.validateUserForm({ formData: data })) {
        const result = await new AuthService().Register({ data });
        return res
          .status(201)
          .json({ message: "Đăng ký tài khoản thành công", data: result });
      }
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống!" });
    }
  };

  Login = async (req, res) => {
    try {
      const data = req.body;
      if (validateForm.validateUserForm({ formData: data })) {
        const result = await new AuthService().Login({ data });
        return res.status(200).json({
          message: "Đăng nhập thành công",
          data: result.data,
          token: result.token,
        });
      }
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống!" });
    }
  };
  Logout = async (req, res) => {
    try {
      const payload = req.payload;
      await new AuthService().Logout({ userId: payload.sub });
      return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ message: error.message || "Lỗi hệ thống!" });
    }
  };
}
