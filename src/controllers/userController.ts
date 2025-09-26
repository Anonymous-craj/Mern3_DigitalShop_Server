import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from "bcrypt";
import { generateToken } from "../services/generateToken";
import generateOtp from "../services/generateOtp";
import sendMail from "../services/sendMail";

class UserController {
  //User Registration
  static async register(req: Request, res: Response) {
    //Accept incoming data
    const { username, email, password } = req.body;
    //Validation and processing
    if (!username || !email || !password) {
      res.status(400).json({
        message: "Please provide email, username and password",
      });
      return;
    }
    //Inserting data into users table

    await User.create({
      username: username,
      email: email,
      password: bcrypt.hashSync(password, 10), //Hashing password into database using bcrypt package which uses blowfish algorithm
    });

    await sendMail({
      to: email,
      subject: "Registration successful on Digital Shop!",
      text: "Welcome to Digital Shop, Thank You for registering!",
    });

    res.status(201).json({
      message: "User registered successfully!",
    });
  }

  //User login
  static async login(req: Request, res: Response) {
    //accept incoming data
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({
        message: "Please provide all ceredentials!",
      });
      return;
    }
    //Check the email if the user trying to login is registered in the users table or not
    const [user] = await User.findAll({
      //findAll() returns array
      where: {
        email: email,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "No user found with that email!",
      });
    } else {
      //if yes--> email exists --> check password too!
      const isEqual = bcrypt.compareSync(password, user.password);
      if (!isEqual) {
        res.status(400).json({
          message: "Invalid password",
        });
      } else {
        //generate token(jwt)
        const token = generateToken(user.id);
        res.status(200).json({
          message: "Login successful!",
          token,
        });
      }
    }
  }

  //forgot Password

  static async handleForgotPassword(req: Request, res: Response) {
    const { email } = req.body || {};
    if (!email) {
      res.status(400).json({
        message: "Please provide email!",
      });
      return;
    }
    //Checking if the email of the user exist in the table?
    const [userExist] = await User.findAll({
      //returns array
      where: {
        email: email,
      },
    });

    if (!userExist) {
      res.status(400).json({
        message: "The user with the above email is not registered!",
      });
      return;
    }

    //generate otp
    const otp = generateOtp();

    await sendMail({
      to: email,
      subject: "Password Change Request for Digital Shop",
      text: `You requested for password reset, here is your otp: ${otp}`,
    });

    res.status(200).json({
      message: "OTP sent!!!",
    });
  }
}

export default UserController;
