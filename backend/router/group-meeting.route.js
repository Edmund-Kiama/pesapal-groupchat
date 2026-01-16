import Router from "express";
import {
  createGroupMeeting,
  getGroupMeetings,
  getGroupMeetingsById,
  getGroupMeetingsByGroupId,
  groupMeetingResponse,
  getGroupMeetingsByCreator,
  getGroupMeetingsByUserMembership,
} from "../controllers/group-meeting.controller.js";
import { adminOnlyAuth } from "../middleware/auth.middleware.js";

const groupMeetingRouter = Router();

// --> /api/v1/group-meeting
groupMeetingRouter.post("/", adminOnlyAuth, createGroupMeeting);
groupMeetingRouter.post("/response", groupMeetingResponse);
groupMeetingRouter.get("/", getGroupMeetings);
// Get meetings for groups created by a specific user
groupMeetingRouter.get("/creator/:userId", getGroupMeetingsByCreator);
// Get meetings for groups that a user is a member of
groupMeetingRouter.get(
  "/user/:userId/groups",
  getGroupMeetingsByUserMembership
);
groupMeetingRouter.get("/:meetingId", getGroupMeetingsById);
groupMeetingRouter.get("/group/groupId", getGroupMeetingsByGroupId);

export default groupMeetingRouter;
