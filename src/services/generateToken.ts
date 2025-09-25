import jwt from "jsonwebtoken";
import { envConfig } from "../config/config";

export const generateToken = (userId: string) => {
  const token = jwt.sign({ userId }, envConfig.jwtSecretKey, {
    expiresIn: envConfig.jwtExpiresIn as any,
  });

  return token;
};
