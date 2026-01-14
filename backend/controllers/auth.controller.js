import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import * as crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { FRONTEND_URL, JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import sendEmail from "../utils/send-email.js";
import Notification from "../models/notification.model.js";

export const signUp = async (req, res, next) => {
  //start db session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //destructures
    const { name, email, password } = req.body;

    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    //checks for duplicates
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    //hashes password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creates new User
    const newUser = await User.create(
      [{ name, email, password: hashedPassword }],
      { session }
    );
    const user = newUser?.[0];

    //creates token
    const token = jwt.sign({ userId: user?._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    //ends session
    await session.commitTransaction();
    session.endSession();

    await Promise.all([
      //notify creator
      Notification.create({
        userId: user?._id,
        type: "USER_CREATION",
        message: `You have successfully signed up with Group Lending. Happy to have you onboard!!`,
        // metadata: { },
      }),

      sendEmail({
        to: email,
        subject: "Welcome to Group Lending",
        message: `You have successfully signed up with Group Lending. Happy to have you onboard!!`,
        html: `
         <p>You have successfully signed up with Group Lending.</p>
         <p>Happy to have you onboard!!</p>
         `,
      }),
    ]);

    //response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    //aborts session
    await session.abortTransaction();
    session.endSession();
    console.error("Error", error);
    next(error);
  }
};

export const adminSignUp = async (req, res, next) => {
  //start db session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //destructures
    const { name, email, password } = req.body;

    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    //checks for duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    //hashes password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creates new User
    const newUser = await User.create(
      [{ name, email, role: "admin", password: hashedPassword }],
      { session }
    );

    const admin = newUser?.[0];

    //creates token
    const token = jwt.sign({ userId: admin?._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    //ends session
    await session.commitTransaction();
    session.endSession();

    await Promise.all([
      //notify creator
      Notification.create({
        userId: admin?._id,
        type: "ADMIN_CREATION",
        message: `You have successfully signed up with Group Lending as an Admin. Happy to have you onboard!!`,
        // metadata: { },
      }),

      sendEmail({
        to: email,
        subject: "Welcome to Group Lending",
        message: `You have successfully signed up with Group Lending as an Admin. Happy to have you onboard!!`,
        html: `
         <p>You have successfully signed up with Group Lending as an Admin.</p>
         <p>Happy to have you onboard!!</p>
         `,
      }),
    ]);

    //response
    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        token,
        admin,
      },
    });
  } catch (error) {
    //aborts session
    await session.abortTransaction();
    session.endSession();
    console.error("Error", error);

    next(error);
  }
};

export const logIn = async (req, res, next) => {
  try {
    //destructure email and password
    const { email, password } = req.body;

    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    //check if email/user exists in our db
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    //compare the password given with db password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid Password");
      error.statusCode = 401;
      throw error;
    }

    //create token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    //return
    res.status(200).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Error", error);

    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; //10min

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password reset",
      message: `Reset your password: ${resetUrl}`,
      html: `
      <p>You requested a password reset.</p>
      <p>
        <a href="${resetUrl}">Reset Password</a>
      </p>
      <p>This link expires in 10 minutes.</p>
    `,
    });

    res.status(200).json({
      success: true,
      message: "If the email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

