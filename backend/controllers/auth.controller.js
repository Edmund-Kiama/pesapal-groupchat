import bcrypt from "bcryptjs";
import * as crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { FRONTEND_URL, JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import sendEmail from "../utils/send-email.js";
import { sequelize } from "../database/db.js";
import { User, Notification } from "../models/index.js";

export const signUp = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, email, password } = req.body;

    // Validate input
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // Check duplicate user
    const existingUser = await User.findOne({
      where: { email },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create(
      {
        name,
        email,
        password: hashedPassword,
      },
      { transaction }
    );

    // Create JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Commit transaction
    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: user?.toJSON(),
      },
    });

    // Side effects (non-transactional)
    await Promise.all([
      Notification.create({
        userId: user.id,
        type: "USER_CREATION",
        message:
          "You have successfully signed up with Group Lending. Happy to have you onboard!!",
      }),

      sendEmail({
        to: email,
        subject: "Welcome to Group Lending",
        message:
          "You have successfully signed up with Group Lending. Happy to have you onboard!!",
        html: `
          <p>You have successfully signed up with Group Lending.</p>
          <p>Happy to have you onboard!!</p>
        `,
      }),
    ]);
  } catch (error) {
    await transaction.rollback();
    console.error("SignUp Error:", error);
    next(error);
  }
};

export const adminSignUp = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
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

    const existingUser = await User.findOne({
      where: { email },
      transaction,
    });

    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create(
      {
        name,
        email,
        password: hashedPassword,
        role: "admin",
      },
      { transaction }
    );

    const token = jwt.sign({ userId: admin.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    await transaction.commit();

    await Promise.all([
      Notification.create({
        userId: admin.id,
        type: "ADMIN_CREATION",
        message:
          "You have successfully signed up with Group Lending as an Admin. Happy to have you onboard!!",
      }),

      sendEmail({
        to: email,
        subject: "Welcome to Group Lending",
        message:
          "You have successfully signed up with Group Lending as an Admin. Happy to have you onboard!!",
        html: `
          <p>You have successfully signed up with Group Lending as an Admin.</p>
          <p>Happy to have you onboard!!</p>
        `,
      }),
    ]);

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        token,
        admin: admin?.toJSON(),
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error", error);
    next(error);
  }
};

export const logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Create JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Response
    res.status(200).json({
      success: true,
      data: {
        user: user?.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
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

    const user = await User.findOne({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash password
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await user.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

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
    console.error("Forgot password error:", error);
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
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};
