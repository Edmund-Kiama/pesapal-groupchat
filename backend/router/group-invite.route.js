import Router from "express";
import {
  createGroupInvite,
  groupInviteResponse,
  groupInviteReceivedByReceiver,
  groupInviteSentBySender,
  cancelGroupInvite,
} from "../controllers/group-invite.controller.js";
import { adminOnlyAuth } from "../middleware/auth.middleware.js";

const groupInviteRouter = Router();

// --> /api/v1/group-invite
groupInviteRouter.post("/", adminOnlyAuth, createGroupInvite);
groupInviteRouter.post("/response", groupInviteResponse);
groupInviteRouter.get("/sender/:senderId", groupInviteSentBySender);
groupInviteRouter.get("/receiver/:receiverId", groupInviteReceivedByReceiver);
groupInviteRouter.delete("/:inviteId", adminOnlyAuth, cancelGroupInvite);

export default groupInviteRouter;
