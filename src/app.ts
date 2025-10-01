import express from "express";
const app = express();

import "./database/connection";
import userRoute from "./routes/userRoute";
import categoryRoute from "./routes/categoryRoute";
import productRoute from "./routes/productRoutes";
app.use(express.json());

// http://localhost:3000
app.use("", userRoute);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRoute);

export default app;
