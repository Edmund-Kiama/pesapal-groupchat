import Router from "express";
import {
  getGroups,
  createGroup,
  getGroupById,
  getGroupUsers,
  addMember,
  getMemberships,
  deleteGroup,
} from "../controllers/group.controller.js";
import { adminOnlyAuth } from "../middleware/auth.middleware.js";

const groupRouter = Router();

// --> /api/v1/group
//groups
groupRouter.post("/", adminOnlyAuth, createGroup);
groupRouter.post("/add-member", adminOnlyAuth, addMember);
groupRouter.get("/", getGroups);
groupRouter.get("/memberships", getMemberships);
groupRouter.get("/:groupId", getGroupById);
groupRouter.get("/:groupId/members", getGroupUsers);
groupRouter.delete("/:groupId", adminOnlyAuth, deleteGroup);


export default groupRouter;
