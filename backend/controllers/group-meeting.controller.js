import sendEmail from "../utils/send-email.js";
import GroupMeeting from "../models/group-meeting.model.js";
import GroupMember from "../models/group-member.model.js";
import Notification from "../models/notification.model.js";
import { formatDateTime } from "../utils/date-time.format.js";
import User from "../models/user.model.js";

export const createGroupMeeting = async (req, res, next) => {
  try {
    const { location, invited, groupId, time } = req.body;
    const user = req.user; // from authentication middleware

    // check missing fields
    const missingFields = [];
    if (!location) missingFields.push("location");
    if (!time?.to) missingFields.push("time.to");
    if (!time?.from) missingFields.push("time.from");
    if (!groupId) missingFields.push("groupId");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    let invitedArray = [];
    let groupMembers = [];
    if (Array.isArray(invited) && invited.length > 0) {
      //only this invited
      invitedArray = invited.map((userId) => ({ userId }));
    } else {
      //all group members
      groupMembers = await GroupMember.find({ groupId })
        .select("userId")
        .populate("userId", "email")
        .lean();

      invitedArray = groupMembers.map((member) => ({
        userId: member?.userId?._id,
      }));
    }

    // create the meeting
    const groupMeeting = await GroupMeeting.create({
      location,
      groupId,
      time,
      created_by: user?._id,
      invited: invitedArray,
    });

    await Promise.all([
      //notify creator
      Notification.create({
        userId: user?._id,
        type: "GROUP_MEETING_CREATED",
        message: "You have created a group meeting",
        metadata: { groupId, meetingId: groupMeeting._id },
      }),

      sendEmail({
        to: user?.email,
        subject: "New Group Meeting",
        message: `You have created a group meeting from ${formatDateTime(
          time.from
        )} to ${formatDateTime(time.to)} located at ${location}`,
        html: `
         <p>You have created a group meeting. See below for details </p>
         <p>Time from: ${formatDateTime(time.from)} </p>
         <p>Time to: ${formatDateTime(time.to)} </p>
         <p>Location: ${location} </p>
         ${
           invitedArray.length > 0
             ? `<p>Invited Guests: ${invitedArray.length} </p>`
             : ""
         }
         <p>You will receive notifications on the guests' response to the meeting .</p>
       `,
      }),

      //notify those invited
      ...invitedArray.map((user) =>
        Notification.create({
          userId: user?.userId,
          type: "GROUP_MEETING_INVITATION",
          message: `You have been invited to a group meeting from ${formatDateTime(
            time.from
          )} to ${formatDateTime(time.to)} located at ${location}`,
          metadata: { groupId, meetingId: groupMeeting._id },
        })
      ),

      ...groupMembers.map((member) =>
        sendEmail({
          to: member?.userId?.email,
          subject: "Group Meeting Invite",
          message: `${
            user.name
          } has invited you to a group meeting from ${formatDateTime(
            time.from
          )} to ${formatDateTime(time.to)} located at ${location}`,
          html: `
           <p>You have been invited to a group meeting. See below for details </p>
           <p>Time from: ${formatDateTime(time.from)} </p>
           <p>Time to: ${formatDateTime(time.to)} </p>
           <p>Location: ${location} </p>
           <p>Your response will be sent to ${user.name}.</p>
         `,
        })
      ),
    ]);

    // return
    res.status(201).json({
      success: true,
      message: "Group Meeting created successfully",
      data: groupMeeting,
    });
  } catch (error) {
    console.error(error)
    next(error);
  }
};

export const groupMeetingResponse = async (req, res, next) => {
  try {
    const { meetingId, status } = req.body;
    const user = req?.user;

    // check missing fields
    const missingFields = [];
    if (!meetingId) missingFields.push("meetingId");
    if (!status) missingFields.push("status");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    //  validate status
    const allowedStatuses = ["accepted", "declined"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    // update the meeting
    const groupMeeting = await GroupMeeting.findOneAndUpdate(
      { _id: meetingId, "invited.userId": user?._id },
      { $set: { "invited.$.status": status } },
      { new: true }
    )
      .populate({
        path: "invited.userId",
        select: "name email",
      })
      .lean();

    if (!groupMeeting) {
      return res.status(404).json({
        success: false,
        message: "Invite not found for this user",
      });
    }

    const groupId = groupMeeting?.groupId;
    const meetingCreatorId = groupMeeting?.created_by;
    const meetingCreator = await User.findById(meetingCreatorId);

    if (!meetingCreator) {
      return res.status(400).json({
        success: false,
        message:
          "Something went wrong. Please check if the creator of this meeting exists.",
      });
    }

    let notificationType;
    if (status === "accepted") {
      notificationType = "GROUP_MEETING_ACCEPTED";
    } else if (status === "declined") {
      notificationType = "GROUP_MEETING_DECLINED";
    }

    await Promise.all([
      // notify sender(admin)
      Notification.create({
        userId: meetingCreatorId,
        type: notificationType,
        message: `${user?.name} ${status} to attend group meeting at ${
          groupMeeting.location
        } from ${formatDateTime(groupMeeting.time.from)} to ${formatDateTime(
          groupMeeting.time.to
        )}`,
        metadata: {
          groupId,
          meetingId,
        },
      }),
      sendEmail({
        to: meetingCreator?.email,
        subject: "Group Meeting Invite Response",
        message: `${
          user?.name
        } has ${status} your meeting invite from ${formatDateTime(
          groupMeeting.time.from
        )} to ${formatDateTime(groupMeeting.time.to)} to be held at ${
          groupMeeting?.location
        }`,
        html: `
           <p>${
             user?.name
           } has <strong>${status}</strong> your group meeting invite. See meeting details below.</p>
           <p>Time from: ${formatDateTime(groupMeeting.time.from)} </p>
           <p>Time to: ${formatDateTime(groupMeeting.time.to)} </p>
           <p>Location: ${groupMeeting?.location} </p>
           ${
             groupMeeting?.invited?.length > 0
               ? `<p>Invited Guests: ${groupMeeting?.invited?.length} </p>`
               : ""
           }`,
      }),
      // notify user
      Notification.create({
        userId: user._id,
        type: notificationType,
        message: `You have ${status} to attend the group meeting at ${
          groupMeeting.location
        } from ${formatDateTime(groupMeeting.time.from)} to ${formatDateTime(
          groupMeeting.time.to
        )}`,
        metadata: {
          groupId,
          meetingId,
        },
      }),
      sendEmail({
        to: user?.email,
        subject: "Group Meeting Invite Response",
        message: `You have ${status} ${
          meetingCreator?.name
        } meeting invite from ${formatDateTime(
          groupMeeting.time.from
        )} to ${formatDateTime(groupMeeting.time.to)} to be held at ${
          groupMeeting?.location
        }`,
        html: `
           <p>You have <strong>${status}</strong> ${
          meetingCreator?.name
        } meeting invite. See meeting details below.</p>
           <p>Time from: ${formatDateTime(groupMeeting.time.from)} </p>
           <p>Time to: ${formatDateTime(groupMeeting.time.to)} </p>
           <p>Location: ${groupMeeting?.location} </p>
           ${
             groupMeeting?.invited?.length > 0
               ? `<p>Invited Guests: ${groupMeeting?.invited?.length} </p>`
               : ""
           }`,
      }),
    ]);

    // return
    res.status(200).json({
      success: true,
      message: "Group Meeting response was successful",
      data: groupMeeting,
    });
  } catch (error) {
    console.error(error)
    next(error);
  }
};

export const getGroupMeetings = async (req, res, next) => {
  try {
    //get all records
    const meetings = await GroupMeeting.find()
      .populate("groupId", "name description")
      .populate("created_by", "name")
      .populate({
        path: "invited.userId",
        select: "name email",
      })
      .lean();

    // return all records
    res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    next(error);
  }
};

export const getGroupMeetingsById = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const meeting = await GroupMeeting.findById(meetingId)
      .populate("groupId", "name description")
      .populate("created_by", "name")
      .populate({
        path: "invited.userId",
        select: "name email",
      })
      .lean();

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting was not found",
      });
    }

    res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error(error);

    next(error);
  }
};

export const getGroupMeetingsByGroupId = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const meeting = await GroupMeeting.find({ groupId })
      .populate("created_by", "name")
      .populate({
        path: "invited.userId",
        select: "name email",
      })
      .lean();

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting was not found",
      });
    }

    res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error(error);

    next(error);
  }
};
