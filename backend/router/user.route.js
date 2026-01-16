import Router from "express";
import {
  getAdmins,
  getUserById,
  getUsers,
  getUserGroups,
  deleteUser,
} from "../controllers/user.controller.js";
import { adminOnlyAuth } from "../middleware/auth.middleware.js";

const userRouter = Router();

// --> /api/v1/user

//get all users
userRouter.get("/", getUsers);
userRouter.get("/admin", getAdmins);
//get one user
userRouter.get("/:userId", getUserById);
//get all groups a user belongs to
userRouter.get("/memberships/:userId", getUserGroups);
//delete user by id (admin only)
userRouter.delete("/:userId", adminOnlyAuth, deleteUser);

export default userRouter;
 