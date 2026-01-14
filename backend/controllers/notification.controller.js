import Notification from "../models/notification.model.js";
import GroupMember from "../models/group-member.model.js";
import mongoose from "mongoose";

// list all notifications
// list notifications by userId

export const getNotifications = async (req, res, next) => {
  try {
    //get all records
    const notifications = await Notification.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    // return all records
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ userId })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationsByGroupId = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const groupObjectId = new mongoose.Types.ObjectId(groupId);

    const user = req.user;

    // verify membership
    const isMember = await GroupMember.exists({
      userId: user?._id,
      groupId: groupObjectId,
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this group's notifications",
      });
    }

    const notifications = await Notification.find({
      "metadata.groupId": groupObjectId,
    })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationsByMeetingId = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const meetingObjectId = new mongoose.Types.ObjectId(meetingId);

    // const userId = req.user._id;

    const notifications = await Notification.find({
      "metadata.meetingId": meetingObjectId,
    })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationsByGroupInviteId = async (req, res, next) => {
  try {
    const { groupInviteId } = req.params;
    const groupInviteObjectId = new mongoose.Types.ObjectId(groupInviteId);

    //   const userId = req.user._id;

    const notifications = await Notification.find({
      "metadata.inviteId": groupInviteObjectId,
    })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};
