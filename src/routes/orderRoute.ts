import express, { Router } from "express";
import OrderController from "../controllers/orderController";
import errorHandler from "../services/errorHandler";
import UserMiddleware, { Role } from "../middleware/userMiddleware";
const router: Router = express.Router();

router
  .route("/")
  .get(
    UserMiddleware.isUserLoggedIn,
    errorHandler(OrderController.fetchMyOrders)
  )
  .post(
    UserMiddleware.isUserLoggedIn,
    errorHandler(OrderController.createOrder)
  );

router
  .route("/all")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Admin),
    errorHandler(OrderController.fetchAllOrders)
  );

router
  .route("/cancel-order/:id")
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Customer),
    errorHandler(OrderController.cancelMyOrder)
  );

router
  .route("/verify-pidx")
  .post(
    UserMiddleware.isUserLoggedIn,
    errorHandler(OrderController.verifyTransaction)
  );

router
  .route("/:id")
  .get(
    UserMiddleware.isUserLoggedIn,
    errorHandler(OrderController.fetchMyOrderDetail)
  );

export default router;
