import express, { Router } from "express";
import UserController from "../controllers/userController";
import errorHandler from "../services/errorHandler";
import UserMiddleware, { Role } from "../middleware/userMiddleware";

const router: Router = express.Router();

router.route("/register").post(errorHandler(UserController.register));
router.route("/login").post(errorHandler(UserController.login));
router
  .route("/forgot-password")
  .post(errorHandler(UserController.handleForgotPassword));
router.route("/verify-otp").post(errorHandler(UserController.verifyOtp));
router
  .route("/reset-password")
  .post(errorHandler(UserController.handleResetPassword));
router
  .route("/users")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Admin),
    errorHandler(UserController.fetchUsers)
  );

router
  .route("/users/:id")
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Admin),
    errorHandler(UserController.deleteUser)
  );

export default router;
