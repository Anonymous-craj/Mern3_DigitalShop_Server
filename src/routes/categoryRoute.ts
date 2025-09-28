import express, { Router } from "express";
import CategoryController from "../controllers/categoryController";
const router: Router = express.Router();

router
  .route("/")
  .get(CategoryController.fetchCategories)
  .post(CategoryController.addCategory);
router
  .route("/:id")
  .patch(CategoryController.updateCategory)
  .delete(CategoryController.deleteCategory);

export default router;
