import express, { Router } from "express";
import UserMiddleware, { Role } from "../middleware/userMiddleware";
import errorHandler from "../services/errorHandler";
import cartController from "../controllers/cartController";
const router: Router = express.Router();

router
  .route("/")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Customer),
    errorHandler(cartController.addToCart)
  )
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Customer),
    errorHandler(cartController.getCartItems)
  );

router
  .route("/:productId")
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Customer),
    errorHandler(cartController.deleteCartItem)
  )
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Customer),
    errorHandler(cartController.updateCartItemQty)
  );

export default router;
