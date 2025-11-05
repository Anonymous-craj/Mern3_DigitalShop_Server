import express from "express";
import path from "path";
import fs from "fs";
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
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "https://digital-shop-blond.vercel.app",
    ],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// http://localhost:8000
app.use("/api", userRoute);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRoute);
app.use("/api/order", orderRoute);
app.use("/api/cart", cartRoute);
app.disable("etag");

// keep uploads next to the compiled server (dist/uploads) OR at project root
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads"); // project-root/uploads
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.static("./src/uploads"));

export default app;
