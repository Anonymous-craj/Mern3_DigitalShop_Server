import express from "express";
const app = express();

import "./database/connection";
import userRoute from "./routes/userRoute";
import categoryRoute from "./routes/categoryRoute";
app.use(express.json());

// http://localhost:3000
app.use("", userRoute);
app.use("/api/category", categoryRoute);

export default app;
