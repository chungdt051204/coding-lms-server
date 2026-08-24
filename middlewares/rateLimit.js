import { rateLimit } from "express-rate-limit";
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 phút
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: "Quá nhiều lần thử! Vui lòng thử lại sau 15 phút!",
});
