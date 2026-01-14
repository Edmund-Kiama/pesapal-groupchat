import Router from "express";
import {
  createGroupMeeting,
  getGroupMeetings,
  getGroupMeetingsById,
  getGroupMeetingsByGroupId,groupMeetingResponse
} from "../controllers/group-meeting.controller.js";
import { adminOnlyAuth } from "../middleware/auth.middleware.js";

const groupMeetingRouter = Router();

// --> /api/v1/group-meeting
groupMeetingRouter.post("/", adminOnlyAuth, createGroupMeeting);
groupMeetingRouter.post("/response", groupMeetingResponse);
groupMeetingRouter.get("/", getGroupMeetings);
groupMeetingRouter.get("/:meetingId", getGroupMeetingsById);
groupMeetingRouter.get("/group/groupId", getGroupMeetingsByGroupId);

export default groupMeetingRouter;
