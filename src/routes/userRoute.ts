import express, { Router } from "express";
import UserController from "../controllers/userController";

const router: Router = express.Router();

router.route("/register").post(UserController.register);
router.route("/login").post(UserController.login);

export default router;
