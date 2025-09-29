import express, { Router } from "express";
import CategoryController from "../controllers/categoryController";
import UserMiddleware from "../middleware/userMiddleware";
const router: Router = express.Router();

router
  .route("/")
  .get(CategoryController.fetchCategories)
  .post(UserMiddleware.isUserLoggedIn, CategoryController.addCategory);
router
  .route("/:id")
  .patch(CategoryController.updateCategory)
  .delete(CategoryController.deleteCategory);

export default router;
