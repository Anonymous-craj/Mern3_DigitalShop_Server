import { Request, Response } from "express";
import User from "../database/models/userModel";

class UserController {
  static async register(req: Request, res: Response) {
    //Accept incoming data
    const { name, email, password } = req.body;
    //Validation and processing
    if (!name || !email || !password) {
      res.status(400).json({
        message: "Please provide email, username and password",
      });
      return;
    }
    //Inserting data into users table

    await User.create({
      name: name,
      email: email,
      password: password,
    });

    res.status(201).json({
      message: "User registered successfully!",
    });
  }
}

export default UserController;
