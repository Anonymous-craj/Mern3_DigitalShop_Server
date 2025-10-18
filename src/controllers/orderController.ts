import { Request, Response } from "express";
import Order from "../database/models/orderModel";
import OrderDetails from "../database/models/orderDetails";
import Payment from "../database/models/paymentModel";
import { OrderStatus, PaymentMethod, PaymentStatus } from "../globals/types";
import axios from "axios";
import Cart from "../database/models/cartModel";
import Product from "../database/models/productModel";
import Category from "../database/models/categoryModel";

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
    const {
      phoneNumber,
      firstName,
      lastName,
      email,
      addressLine,
      city,
      state,
      zipCode,
      totalAmount,
      paymentMethod,
    } = req.body || {};
    const products: IProducts[] = req.body?.products;

    if (
      !phoneNumber ||
      !firstName ||
      !lastName ||
      !email ||
      !addressLine ||
      !city ||
      !state ||
      !zipCode ||
      !totalAmount ||
      products.length == 0
    ) {
      res.status(400).json({
        message:
          "Please provide phoneNumber, shippingAddress, totalAmount and products",
      });
      return;
    }
    //Inserting into Payment Table
    const paymentData = await Payment.create({
      paymentMethod,
    });

    //Inserting into Order Table
    const orderData = await Order.create({
      phoneNumber,
      totalAmount,
      userId: userId,
      firstName,
      lastName,
      email,
      addressLine,
      city,
      state,
      zipCode,
      paymentId: paymentData.id,
    });

    let data;
    //Inserting data into OrderDetails Table
    products.forEach(async function (product) {
      data = await OrderDetails.create({
        quantity: product.productQty,
        productId: product.productId,
        orderId: orderData.id,
      });

      await Cart.destroy({
        where: {
          productId: product.productId,
          userId: userId,
        },
      });
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
        data,
      });
      console.log("Khalti Response:", response.data);
      console.log("Payment URL:", response.data.payment_url);
    } else if (paymentMethod === PaymentMethod.Esewa) {
      //esewa logic
    } else {
      //cod
      res.status(201).json({
        message: "Order created successfully!",
        data,
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

  static async fetchMyOrders(req: OrderRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const orders = await Order.findAll({
      where: {
        userId,
      },
      attributes: ["id", "totalAmount", "orderStatus"],
      include: {
        model: Payment,
        attributes: ["paymentMethod", "paymentStatus"],
      },
    });
    if (orders.length > 0) {
      res.status(200).json({
        message: "Orders fetched successfully!",
        data: orders,
      });
    } else {
      res.status(404).json({
        message: "No orders found!",
        data: [],
      });
    }
  }

  static async fetchMyOrderDetail(
    req: OrderRequest,
    res: Response
  ): Promise<void> {
    const orderId = req.params.id;
    const userId = req.user?.id;

    const orders = await OrderDetails.findAll({
      where: {
        orderId,
      },
      include: [
        {
          model: Order,
          include: [
            {
              model: Payment,
              attributes: ["paymentMethod", "paymentStatus"],
            },
          ],
          attributes: [
            "firstName",
            "lastName",
            "email",
            "totalAmount",
            "phoneNumber",
            "State",
            "City",
            "AddressLine",
            "orderStatus",
          ],
        },
        {
          model: Product,
          include: [
            {
              model: Category,
              attributes: ["categoryName"],
            },
          ],
          attributes: ["productName", "productPrice", "productImageUrl"],
        },
      ],
    });
    if (orders.length > 0) {
      res.status(200).json({
        message: "Order fetched successfully!",
        data: orders,
      });
    } else {
      res.status(404).json({
        message: "No order found!",
        data: [],
      });
    }
  }

  static async cancelMyOrder(req: OrderRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const orderId = req.params.id;

    const [order] = await Order.findAll({
      where: {
        userId,
        id: orderId,
      },
    });
    if (!order) {
      res.status(404).json({
        message: "No order with that orderId",
      });
      return;
    }
    //check if the order is prepared or already on the way user cannot cancel the order

    if (
      order.orderStatus === OrderStatus.Preparation ||
      order.orderStatus === OrderStatus.Ontheway
    ) {
      res.status(403).json({
        message: "You cannot cancel the order because it is already prepared!",
      });
      return;
    }

    //Updating orderStatus
    await Order.update(
      { orderStatus: OrderStatus.Cancelled },
      {
        where: {
          id: orderId,
        },
      }
    );
    res.status(200).json({
      message: "Order cancelled successful!",
    });
  }
}

export default OrderController;
