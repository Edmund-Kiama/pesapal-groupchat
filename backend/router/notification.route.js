import Router from "express";
import {
    getNotifications,
    getUserNotifications,
    getNotificationsByGroupId,
    getNotificationsByMeetingId,
    getNotificationsByGroupInviteId,
} from "../controllers/notification.controller.js";

const notificationRouter = Router();

// --> /api/v1/notification
notificationRouter.get("/", getNotifications);
notificationRouter.get("/user", getUserNotifications);
notificationRouter.get("/group/:groupId", getNotificationsByGroupId);
notificationRouter.get("/meeting/:meetingId", getNotificationsByMeetingId);
notificationRouter.get("/group-invite/:groupInviteId", getNotificationsByGroupInviteId);


export default notificationRouter;
