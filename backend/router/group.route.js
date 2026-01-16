import Router from "express";
import {
  getGroups,
  createGroup,
  getGroupById,
  getGroupUsers,
  addMember,
  getMemberships,
  getUserGroups,
  deleteGroup,
  leaveGroup,
  getGroupsByCreator,
  getMembershipsByCreator,
  removeMember,
  getMembershipsByUserMembership,
} from "../controllers/group.controller.js";
import { adminOnlyAuth } from "../middleware/auth.middleware.js";

const groupRouter = Router();

// --> /api/v1/group
//groups
groupRouter.post("/", adminOnlyAuth, createGroup);
groupRouter.post("/add-member", adminOnlyAuth, addMember);
groupRouter.get("/", getGroups);
// Get groups created by a specific user
groupRouter.get("/creator/:userId", getGroupsByCreator);
groupRouter.get("/memberships", getMemberships);
// Get memberships for groups created by a specific user (admin's groups)
groupRouter.get("/memberships/creator/:userId", getMembershipsByCreator);
// Get memberships for groups that a user is a member of
groupRouter.get("/memberships/user/:userId", getMembershipsByUserMembership);
groupRouter.get("/user/:userId/groups", getUserGroups);
groupRouter.get("/:groupId", getGroupById);
groupRouter.get("/:groupId/members", getGroupUsers);
groupRouter.delete("/:groupId", adminOnlyAuth, deleteGroup);
groupRouter.post("/:groupId/leave", leaveGroup);
// Remove a member from a group (creator only)
groupRouter.delete("/:groupId/members/:userId", adminOnlyAuth, removeMember);


export default groupRouter;
