import Router from "express";
import {
  getGroups,
  createGroup,
  getGroupById,
  getGroupUsers,
  addMember,
  getMemberships,
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


export default groupRouter;
