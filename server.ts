import adminSeeder from "./adminSeeder";
import app from "./src/app";
import { envConfig } from "./src/config/config";
import CategoryController from "./src/controllers/categoryController";

function startServer() {
  const port = envConfig.port || 4000;
  app.listen(port, () => {
    CategoryController.seedCategory();
    console.log(`Server has started at port[${port}]`);
    adminSeeder();
  });
}

startServer();
