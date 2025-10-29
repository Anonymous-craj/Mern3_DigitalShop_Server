import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from "bcrypt";
import { generateToken } from "../services/generateToken";
import generateOtp from "../services/generateOtp";
import sendMail from "../services/sendMail";
import { UniqueConstraintError } from "sequelize";

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

    // Password validation (backend side)
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    try {
      const [data] = await User.findAll({
        where: {
          email,
        },
      });
      if (data) {
        res.status(400).json({
          message: "Please try again later!!",
        });
        return;
      }
      // Inserting data into users table
      await User.create({
        username,
        email,
        password: bcrypt.hashSync(password, 10), // Hashing password into database using bcrypt
      });

      // Send registration success email
      await sendMail({
        to: email,
        subject: "Registration successful on Digital Shop!",
        text: "Welcome to Digital Shop, Thank you for registering!",
      });

      // Respond with success message
      res.status(201).json({
        message: "User registered successfully!",
      });
    } catch (error) {
      // Catch and handle Sequelize unique constraint error (email already exists)
      if (error instanceof UniqueConstraintError) {
        res.status(400).json({
          message:
            "This email is already registered. Please try a different email.",
        });
        return;
      }

      // Catch other errors (e.g., validation errors, unexpected errors)
      console.error(error);
      res.status(500).json({
        message: "An error occurred during registration. Please try again.",
      });
    }
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
      return;
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

    userExist.otp = otp.toString();
    userExist.otpGeneratedTime = Date.now().toString();
    await userExist.save();

    res.status(200).json({
      message: "OTP sent!!!",
    });
  }

  //OTP Verification

  static async verifyOtp(req: Request, res: Response) {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      res.status(400).json({
        message: "Email and OTP are required!",
      });
      return;
    }

    //Checking is the user with the email is registered in User table!

    const [userExist] = await User.findAll({
      where: {
        email: email,
      },
    });

    if (!userExist) {
      res.status(404).json({
        message: "User with the above email isn't registered!",
      });
      return;
    }

    //Check if OTP exists
    if (!userExist.otp || !userExist.otpGeneratedTime) {
      res.status(400).json({
        message: "OTP not found! Please request again.",
      });
      return;
    }

    // ---- EXPIRY CHECK (2 minutes) ----
    const OTP_EXPIRY_MS = 2 * 60 * 1000; // 2 minutes
    // We stored a millisecond epoch string; if you later change storage, also support ISO by fallback parse:
    const issuedAtMs =
      Number(userExist.otpGeneratedTime) ||
      new Date(userExist.otpGeneratedTime as string).getTime();

    // If parsing failed or expired:
    if (!issuedAtMs || Date.now() - issuedAtMs > OTP_EXPIRY_MS) {
      // Invalidate the OTP so it can't be reused
      userExist.otp = null;
      userExist.otpGeneratedTime = null;
      userExist.isOtpVerified = false;
      await userExist.save();
      res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
      return;
    }
    // ---- /EXPIRY CHECK ----

    //Checking the incoming otp from postman with the otp which is stored in User table
    if (userExist.otp !== otp) {
      res.status(400).json({
        message: "Invalid OTP!!!",
      });
      return;
    }
    //Disposing otp once it is used and also verifying otp!
    userExist.otp = null;
    userExist.otpGeneratedTime = null;
    userExist.isOtpVerified = true;
    await userExist.save();

    res.status(200).json({
      message: "OTP is correct!",
    });
  }

  //Handling password Reset
  static async handleResetPassword(req: Request, res: Response) {
    const { email, newPassword, confirmPassword } = req.body || {};

    if (!email || !newPassword || !confirmPassword) {
      res.status(400).json({
        message: "All fields are required!",
      });
      return;
    }

    //Finding if the user with that email is registered in our table
    const [user] = await User.findAll({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(404).json({
        message: "User with the above email isn't registered!",
      });
      return;
    }

    //Validating newPassword and confirmPassword fields
    if (newPassword !== confirmPassword) {
      res.status(400).json({
        message: "newPassword and confirmPassword doesn't match",
      });
      return;
    }

    //Checking if the otp is verified or not, if it's unverified the user cannot reset the password
    if (user.isOtpVerified !== true) {
      res.status(400).json({
        message: "You cannot perform this action",
      });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    user.isOtpVerified = false;
    await user.save();

    res.status(200).json({
      message: "Password reset successfull!!",
    });
  }

  static async fetchUsers(req: Request, res: Response) {
    const users = await User.findAll({
      attributes: ["id", "username", "email"],
    });
    res.status(200).json({
      message: "Users fetched successfully!",
      data: users,
    });
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        message: "Please provide userId",
      });
      return;
    }
    await User.destroy({
      where: {
        id,
      },
    });
    res.status(200).json({
      message: "User deleted successfully!",
    });
  }
}

export default UserController;
