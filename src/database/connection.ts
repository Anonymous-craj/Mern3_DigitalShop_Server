import { Sequelize } from "sequelize-typescript";
import { envConfig } from "../config/config";
import Product from "./models/productModel";
import Category from "./models/categoryModel";

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

sequelize.sync({ force: false, alter: false }).then(() => {
  console.log("Migrated!!!");
});

export default sequelize;
