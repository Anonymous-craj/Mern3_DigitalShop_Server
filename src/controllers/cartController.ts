import { Request, Response } from "express";
import Cart from "../database/models/cartModel";
import Product from "../database/models/productModel";
import Category from "../database/models/categoryModel";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

class CartController {
  async addToCart(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { productId, quantity } = req.body || {};

    if (!productId || !quantity) {
      res.status(400).json({
        message: "Please provide productId and quantity",
      });
      return;
    }

    const cartDataAlreadyExists = await Cart.findOne({
      where: { userId, productId },
    });

    if (cartDataAlreadyExists) {
      cartDataAlreadyExists.quantity += quantity;
      await cartDataAlreadyExists.save();
    } else {
      await Cart.create({
        userId,
        productId,
        quantity,
      });
    }

    const cartItems = await Cart.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: Product,
          include: [
            {
              model: Category,
            },
          ],
        },
      ],
    });
    res.status(200).json({
      message: "Items added to cart successfull!",
      data: cartItems,
    });
  }

  async getCartItems(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const cartItems = await Cart.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: Product,
          attributes: ["id", "productName", "productPrice", "productImageUrl"],
        },
      ],
    });
    if (cartItems.length == 0) {
      res.status(404).json({
        message: "No product in the cart of that id!",
      });
    } else {
      res.status(200).json({
        message: "Cart items fetched successfully!",
        data: cartItems,
      });
    }
  }

  async deleteCartItem(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { productId } = req.params;

    const cartItem = await Product.findByPk(productId);

    if (!cartItem) {
      res.status(404).json({
        message: "No items found with that productId",
      });
      return;
    }

    await Cart.destroy({
      where: {
        productId,
        userId,
      },
    });
    res.status(200).json({
      message: "Cart item deleted successfully!",
    });
  }

  async updateCartItemQty(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
      res.status(400).json({
        message: "Please provide quantity!",
      });
      return;
    }
    const cartItem = await Cart.findOne({
      where: {
        productId,
        userId,
      },
    });

    if (!cartItem) {
      res.status(404).json({
        message: "No product in the cart item with that id",
      });
      return;
    }
    cartItem.quantity = quantity;
    await cartItem.save();
    res.status(200).json({
      message: "Cart Items updated successfull!",
    });
  }
}

export default new CartController();
