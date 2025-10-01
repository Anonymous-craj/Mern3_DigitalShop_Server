import express, { Router } from "express";
import ProductController from "../controllers/productController";
import UserMiddleware, { Role } from "../middleware/userMiddleware";
import { storage, multer } from "../middleware/multerMiddleware";
const upload = multer({ storage: storage });
const router: Router = express.Router();

router
  .route("/")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Admin),
    upload.single("productImage"),
    ProductController.createProduct
  )
  .get(ProductController.getAllProducts);

router
  .route("/:id")
  .get(ProductController.getSingleProduct)
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.accessTo(Role.Admin),
    ProductController.deleteProduct
  );

export default router;
