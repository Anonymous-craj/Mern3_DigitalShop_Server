import { Sequelize } from "sequelize-typescript";
import { envConfig } from "../config/config";

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
      console.log("Error aayo", err);
    });
} catch (error) {
  console.log(error);
}

sequelize.sync({ force: false }).then(() => {
  console.log("Migrated!!!");
});

export default sequelize;
