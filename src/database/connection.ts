import { Sequelize } from "sequelize-typescript";
import { envConfig } from "../config/config";
import Product from "./models/productModel";
import Category from "./models/categoryModel";
import Order from "./models/orderModel";
import User from "./models/userModel";
import Payment from "./models/paymentModel";
import OrderDetails from "./models/orderDetails";

const sequelize = new Sequelize(envConfig.connectionString as string, {
  models: [__dirname + "/models"],
});

try {
  sequelize
    .authenticate()
    .then(() => {
      console.log("Database connection successful");
    })
    .catch((err) => {
      console.log("DB connection error:", err);
    });
} catch (error) {
  console.log(error);
}

//RelationShip between Product and Category
Product.belongsTo(Category, { foreignKey: "categoryId" });
Category.hasOne(Product, { foreignKey: "categoryId" });

//Relation between Order and User
Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });

//Relation between Payment and Order
Payment.belongsTo(Order, { foreignKey: "orderId" });
Order.hasOne(Payment, { foreignKey: "orderId" });

//Relation between OrderDetails and Order
OrderDetails.belongsTo(Order, { foreignKey: "orderId" });
Order.hasMany(OrderDetails, { foreignKey: "orderId" });

//Relation between OrderDetails and Product
OrderDetails.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(OrderDetails, { foreignKey: "productId" });

sequelize.sync({ force: false, alter: false }).then(() => {
  console.log("Migrated!!!");
});

export default sequelize;
