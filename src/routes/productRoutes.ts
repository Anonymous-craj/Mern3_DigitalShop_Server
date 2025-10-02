import express, { Router } from "express";
import ProductController from "../controllers/productController";
import UserMiddleware, { Role } from "../middleware/userMiddleware";
import { storage, multer } from "../middleware/multerMiddleware";
import errorHandler from "../services/errorHandler";
const upload = multer({ storage: storage });
const router: Router = express.Router();

router
  .route("/")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Admin),
    upload.single("productImage"),
    errorHandler(ProductController.createProduct)
  )
  .get(errorHandler(ProductController.getAllProducts));

router
  .route("/:id")
  .get(errorHandler(ProductController.getSingleProduct))
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Admin),
    errorHandler(ProductController.deleteProduct)
  );

export default router;
