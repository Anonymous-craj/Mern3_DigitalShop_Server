import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/config";

class UserMiddleware {
  static async isUserLoggedIn(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    //Accepting token from postman
    const token = req.headers.authorization;
    if (!token) {
      res.status(400).json({
        message: "Token not provided!",
      });
      return;
    }

    // Validating if the token is legit or not?
    jwt.verify(token, envConfig.jwtSecretKey, (err, result) => {
      if (err) {
        res.status(403).json({
          message: "Invalid token!!!",
        });
      } else {
        console.log(result);
        next();
      }
    });
  }
}

export default UserMiddleware;
