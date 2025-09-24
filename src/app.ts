import express from "express";
const app = express();

import "./database/connection";
import userRoute from "./routes/userRoute";
app.use(express.json());

// http://localhost:3000
app.use("", userRoute);

export default app;
