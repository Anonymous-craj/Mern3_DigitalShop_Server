import express, { Router } from "express";
import UserController from "../controllers/userController";
import errorHandler from "../services/errorHandler";

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

export default router;
