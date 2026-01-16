import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { User } from "../models/index.js";

export const authenticate = async (req, res, next) => {
  try {
    //check if token exists
    let token;
    if (
      req?.headers?.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    //verify token and find its userId
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    req.user = user;
    // console.log("Token >> ", token)

    //next
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
      error: error.message,
    });
  }
};

export const adminOnlyAuth = async (req, res, next) => {
  try {
    //check if user is admin
    if (req?.user?.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access (Admin Priviledges Only)",
      });
    }
    //next
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
      error: error.message,
    });
  }
};
