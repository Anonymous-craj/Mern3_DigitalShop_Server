import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/config";
import User from "../database/models/userModel";

export enum Role {
  Admin = "admin",
  Customer = "customer",
}

interface AuthRequest extends Request {
  user?: {
    username: string;
    email: string;
    password: string;
    role: string;
    id: string;
  };
}
class UserMiddleware {
  static async isUserLoggedIn(
    req: AuthRequest,
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
    jwt.verify(token, envConfig.jwtSecretKey, async (err, result: any) => {
      if (err) {
        res.status(403).json({
          message: "Invalid token!!!",
        });
      } else {
        const userData = await User.findByPk(result.userId); //User data find garerw dinxa(email, password, role)
        if (!userData) {
          res.status(404).json({
            message: "No user with that userId",
          });
          return;
        }
        req.user = userData;
        next();
      }
    });
  }

  static accessTo(...roles: Role[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      let userRole = req.user?.role as Role;
      if (!roles.includes(userRole)) {
        res.status(403).json({
          message: "You do not have permission to perform this action!",
        });
        return;
      }
      next();
    };
  }
}

export default UserMiddleware;
