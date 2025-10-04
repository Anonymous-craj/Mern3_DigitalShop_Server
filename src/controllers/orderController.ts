import { Request, Response } from "express";
import Order from "../database/models/orderModel";
import OrderDetails from "../database/models/orderDetails";
import Payment from "../database/models/paymentModel";
import { PaymentMethod, PaymentStatus } from "../globals/types";
import axios from "axios";

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
    const paymentData = await Payment.create({
      orderId: orderData.id,
      paymentMethod,
    });
    if (paymentMethod == PaymentMethod.Khalti) {
      //khalti logic
      const data = {
        return_url: "http://localhost:5173/",
        website_url: "http://localhost:5173/",
        amount: totalAmount * 100,
        purchase_order_id: orderData.id,
        purchase_order_name: "order_" + orderData.id,
      };
      const response = await axios.post(
        "https://dev.khalti.com/api/v2/epayment/initiate/",
        data,
        {
          headers: {
            Authorization: "Key b698937cd11b474b9e33cdbdac2888df",
          },
        }
      );
      const khaltiResponse = response.data;
      paymentData.pidx = khaltiResponse.pidx;
      await paymentData.save();
      res.status(201).json({
        message: "Order created successfully!",
        url: khaltiResponse.payment_url,
      });
    } else if (paymentMethod === PaymentMethod.Esewa) {
      //esewa logic
    } else {
      res.status(201).json({
        message: "Order created successfully!",
      });
    }
  }

  static async verifyTransaction(
    req: OrderRequest,
    res: Response
  ): Promise<void> {
    const { pidx } = req.body || {};
    if (!pidx) {
      res.status(400).json({
        message: "Please provide pidx",
      });
      return;
    }

    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      {
        pidx: pidx,
      },
      {
        headers: {
          Authorization: "Key b698937cd11b474b9e33cdbdac2888df",
        },
      }
    );
    const data = response.data;
    if (data.status === "Completed") {
      await Payment.update(
        { paymentStatus: PaymentStatus.Paid },
        {
          where: {
            pidx: pidx,
          },
        }
      );
      res.status(200).json({
        message: "Payment verified successfull!",
      });
    } else {
      res.status(400).json({
        message: "Payment not verified or cancelled!",
      });
    }
  }
}

export default OrderController;
