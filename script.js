import dotenv from "dotenv";
dotenv.config();
import connectDB from "./configs/database.js";
connectDB();
import "./configs/passport.js";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
const app = express();
const port = 3000;
import { authRouter } from "./routers/authRouter.js";
import { roleRouter } from "./routers/roleRouter.js";
import { userRouter } from "./routers/userRouter.js";
import { categoryRouter } from "./routers/categoryRouter.js";
import { courseRouter } from "./routers/courseRouter.js";
import { lessonRouter } from "./routers/lessonRouter.js";
import { enrollmentRouter } from "./routers/enrollmentRouter.js";
import { lessonProgressRouter } from "./routers/lessonProgressRouter.js";
import { testRouter } from "./routers/testRouter.js";
import { questionRouter } from "./routers/questionRouter.js";
import { cartRouter } from "./routers/cartRouter.js";
import { cartItemRouter } from "./routers/cartItemRouter.js";
import { orderRouter } from "./routers/orderRouter.js";
import { notificationRouter } from "./routers/notificationRouter.js";
import { testResultRouter } from "./routers/testResultRouter.js";
import { ratingRouter } from "./routers/ratingRouter.js";
import { statisticsRouter } from "./routers/statisticsRouter.js";
import { messageRouter } from "./routers/messageRouter.js";
import { conversationRouter } from "./routers/conversationRouter.js";
import { aiRouter } from "./routers/aiRouter.js";
import { MessageService } from "./services/messageService.js";
import { NotificationService } from "./services/notificationService.js";
import { UserService } from "./services/userService.js";

const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.URL_FRONTEND,
    credentials: true,
  },
});
app.use(cors({ origin: process.env.URL_FRONTEND, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", authRouter);
app.use("/", roleRouter);
app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/", courseRouter);
app.use("/", lessonRouter);
app.use("/", enrollmentRouter);
app.use("/", lessonProgressRouter);
app.use("/", testRouter);
app.use("/", questionRouter);
app.use("/", cartRouter);
app.use("/", cartItemRouter);
app.use("/", orderRouter);
app.use("/", notificationRouter);
app.use("/", testResultRouter);
app.use("/", ratingRouter);
app.use("/", statisticsRouter);
app.use("/", messageRouter);
app.use("/", conversationRouter);
app.use("/", aiRouter);

io.on("connection", (socket) => {
  socket.on("join-user", (userId) => {
    socket.join(userId);
  });
  socket.on("join-instructor", (instructorId) => {
    socket.join(instructorId);
  });
  socket.on("join-admin", (adminId) => {
    socket.join(adminId);
  });
  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });
  socket.on("send-message", async (data) => {
    const result = await new MessageService().postMessage({ data });
    socket.join(result?.conversationId.toString());
    io.to(data.instructorId).emit("new-message", result); //Gửi đến room Instructor
    io.to(result?.conversationId.toString()).emit("received-message", result); // Gửi đến room Conversation
  });
  socket.on("post-comment", async (data) => {
    const result = await new NotificationService().createNotification({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
    });
    io.to(data.userId).emit("new-notification", result);
  });
});
app.get("/", (req, res) => {
  return res.json("Server is running...");
});
server.listen(port, () => {
  console.log("Server đang chạy với port:" + port);
});
