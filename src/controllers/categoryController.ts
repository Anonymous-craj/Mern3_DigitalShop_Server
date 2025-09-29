import Category from "../database/models/categoryModel";
import { Request, Response } from "express";

class CategoryController {
  static categoryData = [
    {
      categoryName: "Electronics",
    },
    {
      categoryName: "Groceries",
    },
    {
      categoryName: "Foods and Beverages",
    },
  ];
  static async seedCategory(): Promise<void> {
    const [datas] = await Category.findAll();
    if (!datas) {
      await Category.bulkCreate(this.categoryData);
      console.log("Categories seeded!");
    } else {
      console.log("Categories already seeded!");
    }
  }

  //Read Categories
  static async fetchCategories(req: Request, res: Response): Promise<void> {
    const data = await Category.findAll();

    res.status(200).json({
      message: "Fetched categories successfully!",
      data: data,
    });
  }

  //Add Categories

  static async addCategory(req: Request, res: Response): Promise<void> {
    const { categoryName } = req.body || {};

    if (!categoryName) {
      res.status(400).json({
        message: "Please provide category name!",
      });
      return;
    }

    await Category.create({
      categoryName,
    });
    res.status(201).json({
      message: "Category created successfully!",
    });
  }

  //Delete Category
  static async deleteCategory(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: "Please provide id of the category you want to delete!",
      });
    } else {
      const data = await Category.findByPk(id);

      if (!data) {
        res.status(404).json({
          message: "No category with that id!",
        });
      } else {
        await Category.destroy({
          where: {
            id,
          },
        });

        res.status(200).json({
          message: "Category deleted successfully!",
        });
      }
    }
  }

  //Update Categories
  static async updateCategory(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { categoryName } = req.body;
    if (!id || !categoryName) {
      res.status(400).json({
        message:
          "Please provide id, category Name of the category you want to delete!",
      });
    } else {
      const data = await Category.findByPk(id);

      if (!data) {
        res.status(404).json({
          message: "No category with that id!",
        });
      } else {
        await Category.update(
          {
            categoryName,
          },
          {
            where: {
              id,
            },
          }
        );
        res.status(200).json({
          message: "Categories updated successfully!",
        });
      }
    }
  }
}

export default CategoryController;
