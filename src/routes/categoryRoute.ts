import express, { Router } from "express";
import CategoryController from "../controllers/categoryController";
import UserMiddleware, { Role } from "../middleware/userMiddleware";
const router: Router = express.Router();

router
  .route("/")
  .get(CategoryController.fetchCategories)
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Admin),
    CategoryController.addCategory
  );
router
  .route("/:id")
  .patch(CategoryController.updateCategory)
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Admin),
    CategoryController.deleteCategory
  );

export default router;
