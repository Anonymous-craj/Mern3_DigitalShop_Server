import adminSeeder from "./adminSeeder";
import app from "./src/app";
import { envConfig } from "./src/config/config";
import CategoryController from "./src/controllers/categoryController";
import { Server } from "socket.io";
import jwt, { JwtPayload, VerifyErrors, Secret } from "jsonwebtoken";
import User from "./src/database/models/userModel";
import Order from "./src/database/models/orderModel";
import { OrderStatus } from "./src/globals/types";
import http from "http";

function startServer() {
  const port = envConfig.port || 4000;
  const httpServer = http.createServer(app); // use http.Server, not express.listen()

  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173", // local dev frontend
        "https://digital-shop-blond.vercel.app", // your live Vercel frontend
      ],
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: false,
    },
    transports: ["websocket", "polling"], // help with Render websocket upgrade
    path: "/socket.io", // ensure consistent path
  });

  httpServer.listen(port, () => {
    console.log(`✅ Server has started at port [${port}]`);
    CategoryController.seedCategory();
    adminSeeder();
  });

  // 🟢 Track online users
  let onlineUsers: { socketId: string; userId: string; role: string }[] = [];

  const addToOnlineUsers = (socketId: string, userId: string, role: string) => {
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    onlineUsers.push({ socketId, userId, role });
  };

  // 🟣 Socket.IO connection handler
  io.on("connection", (socket) => {
    const { token } = socket.handshake.auth || {};

    if (token) {
      jwt.verify(
        token,
        envConfig.jwtSecretKey as Secret,
        async (
          err: VerifyErrors | null,
          decoded: JwtPayload | string | undefined
        ) => {
          if (err) {
            console.error("❌ Invalid token:", err.message);
            socket.emit("error", "Invalid token");
            return;
          }
          const payload = decoded as JwtPayload; // if you sign with an object
          const userId = payload.userId as string;

          const userData = await User.findByPk(userId);
          if (!userData) {
            socket.emit("error", "No user found with this ID");
            return;
          }

          addToOnlineUsers(socket.id, userId, userData.role);
          console.log(`🟢 ${userData.role} connected: ${userData.username}`);
        }
      );
    } else {
      socket.emit("error", "Please provide a valid token!");
    }

    socket.on("updateOrderStatus", async (data) => {
      const { status, orderId, userId } = data;
      const findUser = onlineUsers.find((user) => user.userId === userId);

      await Order.update({ orderStatus: status }, { where: { id: orderId } });

      if (findUser) {
        io.to(findUser.socketId).emit("statusUpdated", data);
        console.log(`🔄 Status updated for user ${userId}`);
      } else {
        socket.emit("error", "User is not online!");
      }
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });
}

startServer();
