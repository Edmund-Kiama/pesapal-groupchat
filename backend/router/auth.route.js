import Router from "express";
import {
  adminSignUp,
  logIn,
  signUp,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const authRouter = Router();

// --> /api/v1/auth
authRouter.post("/sign-up", signUp);
authRouter.post("/admin/sign-up", adminSignUp);
authRouter.post("/log-in", logIn);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

export default authRouter