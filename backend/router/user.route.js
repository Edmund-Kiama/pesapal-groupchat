import Router from "express";
import {
  getAdmins,
  getUserById,
  getUsers,
  getUserGroups,
} from "../controllers/user.controller.js";

const userRouter = Router();

// --> /api/v1/user

//get all users
userRouter.get("/", getUsers);
userRouter.get("/admin", getAdmins);
//get one user
userRouter.get("/:userId", getUserById);
//get all groups a user belongs to
userRouter.get("/memberships/:userId", getUserGroups);

export default userRouter;
 