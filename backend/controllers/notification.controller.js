import { GroupMember, User, Notification } from "../models/index.js";

export const getNotifications = async (req, res, next) => {
  try {
    // fetch all notifications with associated user info
    const notifications = await Notification.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name",  "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: notifications.map((n) => n.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // fetch notifications for this user
    const notifications = await Notification.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: notifications.map((n) => n.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationsByGroupId = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Verify membership
    const isMember = await GroupMember.findOne({
      where: {
        userId,
        groupId,
      },
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this group's notifications",
      });
    }

    // Fetch notifications
    const notifications = await Notification.findAll({
      where: {
        groupId,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: notifications.map((n) => n.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationsByMeetingId = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    // Fetch notifications where metadata contains meetingId
    const notifications = await Notification.findAll({
      where: {
        meetingId,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: notifications.map((n) => n.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationsByGroupInviteId = async (req, res, next) => {
  try {
    const { groupInviteId } = req.params;

    // Fetch notifications where metadata contains inviteId
    const notifications = await Notification.findAll({
      where: {inviteId: groupInviteId
      },
      include: [
        {
          model: User,
          as: "user", 
          attributes: ["id", "name", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: notifications.map((n) => n.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

