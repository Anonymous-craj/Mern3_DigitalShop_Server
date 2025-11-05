import { Sequelize } from "sequelize-typescript";
import dns from "node:dns/promises";
import { envConfig } from "../config/config";

// Build a pg connection string that prefers IPv4 and enforces SSL
async function buildConnectionString(raw: string): Promise<string> {
  const url = new URL(raw);

  // Force IPv4 by resolving the hostname to an A record
  const { address } = await dns.lookup(url.hostname, { family: 4 });
  url.hostname = address;

  // Ensure SSL is enabled via query param for providers that require it
  if (!url.searchParams.has("sslmode") && !url.searchParams.has("ssl")) {
    url.searchParams.set("sslmode", "require");
  }

  return url.toString();
}

let sequelize: Sequelize; // will be created in initDB()

export async function initDB(): Promise<Sequelize> {
  const connStr = await buildConnectionString(
    envConfig.connectionString as string
  );

  sequelize = new Sequelize(connStr, {
    logging: false,
    models: [__dirname + "/models"],
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    pool: { max: 10, min: 0, idle: 10_000, acquire: 30_000 },
  });

  // --- Associations (keep after models are registered) ---
  const { default: Product } = await import("./models/productModel");
  const { default: Category } = await import("./models/categoryModel");
  const { default: Order } = await import("./models/orderModel");
  const { default: User } = await import("./models/userModel");
  const { default: Payment } = await import("./models/paymentModel");
  const { default: OrderDetails } = await import("./models/orderDetails");
  const { default: Cart } = await import("./models/cartModel");

  // Product ↔ Category
  Product.belongsTo(Category, { foreignKey: "categoryId" });
  Category.hasOne(Product, { foreignKey: "categoryId" }); // consider hasMany if multiple products per category

  // Order ↔ User
  Order.belongsTo(User, { foreignKey: "userId" });
  User.hasMany(Order, { foreignKey: "userId" });

  // Payment ↔ Order
  Order.belongsTo(Payment, { foreignKey: "paymentId" });
  Payment.hasOne(Order, { foreignKey: "paymentId" });

  // OrderDetails ↔ Order
  OrderDetails.belongsTo(Order, { foreignKey: "orderId" });
  Order.hasMany(OrderDetails, { foreignKey: "orderId" });

  // OrderDetails ↔ Product
  OrderDetails.belongsTo(Product, { foreignKey: "productId" });
  Product.hasMany(OrderDetails, { foreignKey: "productId" });

  // Cart ↔ User
  Cart.belongsTo(User, { foreignKey: "userId" });
  User.hasOne(Cart, { foreignKey: "userId" });

  // Cart ↔ Product
  Cart.belongsTo(Product, { foreignKey: "productId" });
  Product.hasMany(Cart, { foreignKey: "productId" });

  // Connect + Sync
  await sequelize.authenticate();
  console.log("Database connection successful");

  await sequelize.sync({ force: false, alter: false });
  console.log("Migrated!!!");

  return sequelize;
}

// Optional getter if you need direct access after init
export function getSequelize(): Sequelize {
  if (!sequelize)
    throw new Error("Sequelize not initialized. Call initDB() first.");
  return sequelize;
}
