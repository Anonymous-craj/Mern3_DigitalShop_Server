import adminSeeder from "./adminSeeder";
import app from "./src/app";
import { envConfig } from "./src/config/config";
import CategoryController from "./src/controllers/categoryController";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./src/database/models/userModel";
import Order from "./src/database/models/orderModel";
import { OrderStatus } from "./src/globals/types";
function startServer() {
  const port = envConfig.port || 4000;
  const server = app.listen(port, () => {
    CategoryController.seedCategory();
    console.log(`Server has started at port[${port}]`);
    adminSeeder();
  });

  const io = new Server(server, {
    cors: {
      origin: [
        "https://digital-shop-blond.vercel.app",
        "digital-shop-git-main-siraj-basnets-projects.vercel.app",
        "digital-shop-i1j7xbybg-siraj-basnets-projects.vercel.app",
      ],
    },
  }); //Passing argument http request in the Server class because the first request is always a http request before connecting in websocket(Three way handshake)

  //Made an array onLineUsers to track users if they are online as soon as they connect with our project
  let onlineUsers: { socketId: string; userId: string; role: string }[] = [];
  let addToOnlineUsers = (socketId: string, userId: string, role: string) => {
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
    onlineUsers.push({ socketId, userId, role });
  };

  //websocket connection
  io.on("connection", (socket) => {
    const { token } = socket.handshake.auth; //jwt

    //Checking if the token provided is legit or not
    if (token) {
      console.log(token);

      jwt.verify(
        token as string,
        envConfig.jwtSecretKey,
        async (err, result: any) => {
          if (err) {
            socket.emit("error", err);
          } else {
            const userData = await User.findByPk(result.userId); //User data find garerw dinxa(email, password, role)
            if (!userData) {
              socket.emit("error", "No user with that id!");
              return;
            }
            //If token is verified grab userId
            addToOnlineUsers(socket.id, result.userId, userData.role);
          }
        }
      );
    } else {
      socket.emit("error", "Please provide token!");
    }

    socket.on("updateOrderStatus", async (data) => {
      const { status, orderId, userId } = data;
      //Check if the userId is in our onlineUsers Array
      const findUser = onlineUsers.find((user) => user.userId); //(socketId, userId, role)
      await Order.update(
        {
          orderStatus: status,
        },
        {
          where: {
            id: orderId,
          },
        }
      );
      if (findUser) {
        io.to(findUser.socketId).emit("statusUpdated", data);
        console.log(findUser);
      } else {
        socket.emit("error", "User is not online!");
      }
    });
  });
}

startServer();
