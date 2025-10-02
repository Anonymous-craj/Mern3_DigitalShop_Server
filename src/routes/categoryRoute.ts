import express, { Router } from "express";
import CategoryController from "../controllers/categoryController";
import UserMiddleware, { Role } from "../middleware/userMiddleware";
import errorHandler from "../services/errorHandler";
const router: Router = express.Router();

router
  .route("/")
  .get(errorHandler(CategoryController.fetchCategories))
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Admin),
    errorHandler(CategoryController.addCategory)
  );
router
  .route("/:id")
  .patch(errorHandler(CategoryController.updateCategory))
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Admin),
    errorHandler(CategoryController.deleteCategory)
  );

export default router;
