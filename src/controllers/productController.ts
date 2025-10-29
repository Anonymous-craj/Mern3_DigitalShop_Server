import { Request, Response } from "express";
import Product from "../database/models/productModel";
import Category from "../database/models/categoryModel";

class ProductController {
  static async createProduct(req: Request, res: Response): Promise<void> {
    const {
      productName,
      productDescription,
      productPrice,
      productTotalStock,
      discount,
      categoryId,
    } = req.body || {};

    const filename = req.file
      ? req.file.filename
      : "https://imgs.search.brave.com/BusPQb9nLSop7o-H0Z430q7-vz-dic3L5qMvP_dZtb4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzc0L2Ez/L2I2Lzc0YTNiNmE4/ODU2YjAwNGRmZmY4/MjRhZTk2NjhmZTli/LmpwZw";
    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !productTotalStock ||
      !categoryId
    ) {
      res.status(400).json({
        message:
          "Please provide productName, productDescription, productPrice, productTotalStock",
      });
      return;
    }

    const products = await Product.create({
      productName,
      productDescription,
      productPrice,
      productTotalStock,
      discount: discount || 0,
      categoryId,
      productImageUrl: filename,
    });
    res.status(201).json({
      message: "Product created successfully!",
      data: products,
    });
  }

  static async getAllProducts(req: Request, res: Response): Promise<void> {
    const datas = await Product.findAll({
      include: [
        {
          model: Category,
        },
      ],
    });
    if (datas.length === 0) {
      res.status(404).json({
        message: "No product with that categoryId",
      });
    } else {
      res.status(200).json({
        message: "Products fetched successfully",
        data: datas,
      });
    }
  }

  static async getSingleProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = await Product.findAll({
      where: {
        id: id,
      },
      include: [
        {
          model: Category,
          attributes: ["id", "categoryName"],
        },
      ],
    });
    if (data.length === 0) {
      res.status(404).json({
        message: "No product with that categoryId",
      });
    } else {
      res.status(200).json({
        message: "Single Product fetched successfully",
        data: data,
      });
    }
  }

  static async deleteProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = await Product.findAll({
      where: {
        id: id,
      },
    });
    if (data.length === 0) {
      res.status(404).json({
        message: "No product with that id",
      });
    } else {
      await Product.destroy({
        where: {
          id: id,
        },
      });
      res.status(200).json({
        message: "Product deleted successfully!",
      });
    }
  }
}

export default ProductController;
