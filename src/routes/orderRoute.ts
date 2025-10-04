import express, { Router } from "express";
import OrderController from "../controllers/orderController";
import errorHandler from "../services/errorHandler";
import UserMiddleware from "../middleware/userMiddleware";
const router: Router = express.Router();

router
  .route("/")
  .post(
    UserMiddleware.isUserLoggedIn,
    errorHandler(OrderController.createOrder)
  );

router
  .route("/verify-pidx")
  .post(
    UserMiddleware.isUserLoggedIn,
    errorHandler(OrderController.verifyTransaction)
  );

export default router;
