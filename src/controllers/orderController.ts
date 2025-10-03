import { Request, Response } from "express";
import Order from "../database/models/orderModel";
import OrderDetails from "../database/models/orderDetails";
import Payment from "../database/models/paymentModel";
import { PaymentMethod } from "../globals/types";

interface IProducts {
  productId: string;
  productQty: string;
}

interface OrderRequest extends Request {
  user?: {
    id: string;
  };
}

class OrderController {
  static async createOrder(req: OrderRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { phoneNumber, shippingAddress, totalAmount, paymentMethod } =
      req.body || {};
    const products: IProducts[] = req.body?.products;

    if (
      !phoneNumber ||
      !shippingAddress ||
      !totalAmount ||
      products.length == 0
    ) {
      res.status(400).json({
        message:
          "Please provide phoneNumber, shippingAddress, totalAmount and products",
      });
      return;
    }
    //Inserting into Order Table
    const orderData = await Order.create({
      phoneNumber,
      shippingAddress,
      totalAmount,
      userId: userId,
    });

    //Inserting data into OrderDetails Table
    products.forEach(async function (product) {
      await OrderDetails.create({
        quantity: product.productQty,
        productId: product.productId,
        orderId: orderData.id,
      });
    });

    //Inserting into Payment Table
    if (paymentMethod == PaymentMethod.Cod) {
      await Payment.create({
        orderId: orderData.id,
        paymentMethod,
      });
    } else if (paymentMethod == PaymentMethod.Khalti) {
      //khalti logic
    } else {
      //esewa logic
    }

    res.status(201).json({
      message: "Order created successfully!",
    });
  }
}

export default OrderController;
