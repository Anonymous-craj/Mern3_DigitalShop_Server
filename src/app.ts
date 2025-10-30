import express from "express";
const app = express();

import "./database/connection";
import cors from "cors";
import userRoute from "./routes/userRoute";
import categoryRoute from "./routes/categoryRoute";
import productRoute from "./routes/productRoutes";
import orderRoute from "./routes/orderRoute";
import cartRoute from "./routes/cartRoute";
app.use(
  cors({
    origin: "https://digital-shop-blond.vercel.app/",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// http://localhost:3000
app.use("/api", userRoute);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRoute);
app.use("/api/order", orderRoute);
app.use("/api/cart", cartRoute);
app.disable("etag");

app.use(express.static("./src/uploads"));

export default app;
