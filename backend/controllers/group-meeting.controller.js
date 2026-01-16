import sendEmail from "../utils/send-email.js";
import { formatDateTime } from "../utils/date-time.format.js";
import {
  User,
  Notification,
  GroupMeeting,
  GroupMeetingInvite,
  GroupMember,
  Group,
} from "../models/index.js";
import { sequelize } from "../database/db.js";

export const createGroupMeeting = async (req, res, next) => {
  const transaction = await sequelize.transaction();

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
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // get invited users
    let invitedUsers = [];
    let groupMembers = [];

    if (Array.isArray(invited) && invited.length > 0) {
      invitedUsers = invited.map((id) => ({ userId: id }));
    } else {
      groupMembers = await GroupMember.findAll({
        where: { groupId },
        include: [{ model: User, as: "user" }],
      });
      invitedUsers = groupMembers.map((member) => ({
        userId: member.userId,
      }));
    }

    // create the group meeting
    const groupMeeting = await GroupMeeting.create(
      {
        location,
        groupId,
        time_from: time.from,
        time_to: time.to,
        created_by: user.id,
      },
      { transaction }
    );

    // create invites
    let invites = [];
    if (invitedUsers.length > 0) {
      const inviteData = invitedUsers.map((u) => ({
        meetingId: groupMeeting.id,
        userId: u.userId,
        invitedBy: user.id,
      }));

      invites = await GroupMeetingInvite.bulkCreate(inviteData, {
        transaction,
      });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Group Meeting created successfully",
      data: groupMeeting?.toJSON(),
    });

    // send notifications & emails
    const notifications = [
      Notification.create({
        userId: user.id,
        type: "GROUP_MEETING_CREATED",
        message: "You have created a group meeting",
        groupId,
        meetingId: groupMeeting.id,
      }),
      ...invites.map((invite) =>
        Notification.create({
          userId: invite.userId,
          type: "GROUP_MEETING_INVITATION",
          message: `You have been invited to a group meeting from ${formatDateTime(
            time.from
          )} to ${formatDateTime(time.to)} at ${location}`,
          groupId,
          meetingId: groupMeeting.id,
        })
      ),
    ];

    const emails = [
      sendEmail({
        to: user.email,
        subject: "New Group Meeting",
        message: `You have created a group meeting from ${formatDateTime(
          time.from
        )} to ${formatDateTime(time.to)} at ${location}`,
        html: `
          <p>Group Meeting Details:</p>
          <p>Location: ${location}</p>
          <p>From: ${formatDateTime(time.from)}</p>
          <p>To: ${formatDateTime(time.to)}</p>
          <p>Total Invited: ${invitedUsers.length}</p>
        `,
      }),
      ...groupMembers.map((member) =>
        sendEmail({
          to: member.user.email,
          subject: "Group Meeting Invite",
          message: `${user.name} has invited you to a group meeting.`,
          html: `
            <p>Group Meeting Details:</p>
            <p>Location: ${location}</p>
            <p>From: ${formatDateTime(time.from)}</p>
            <p>To: ${formatDateTime(time.to)}</p>
            <p>Organizer: ${user.name}</p>
          `,
        })
      ),
    ];

    Promise.all([...notifications, ...emails]).catch((err) =>
      console.error("CreateGroupMeeting side effects failed:", err)
    );
  } catch (error) {
    await transaction.rollback();
    console.error("CreateGroupMeeting Error:", error);
    next(error);
  }
};

export const groupMeetingResponse = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { meetingId, status } = req.body;
    const user = req.user;

    // check missing fields
    const missingFields = [];
    if (!meetingId) missingFields.push("meetingId");
    if (!status) missingFields.push("status");

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // validate status
    const allowedStatuses = ["accepted", "declined"];
    if (!allowedStatuses.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    // find the invite
    const invite = await GroupMeetingInvite.findOne({
      where: { meetingId, userId: user.id },
      include: [
        {
          model: GroupMeeting,
          include: [
            {
              model: User,
              as: "creator",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    if (!invite) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Invite not found for this user",
      });
    }

    // update status
    invite.status = status;
    await invite.save({ transaction });
    await transaction.commit();

    const groupMeeting = invite.GroupMeeting;
    const meetingCreator = groupMeeting.created_by;

    const groupId = groupMeeting.groupId;

    let notificationType =
      status === "accepted"
        ? "GROUP_MEETING_ACCEPTED"
        : "GROUP_MEETING_DECLINED";

    res.status(200).json({
      success: true,
      message: "Group Meeting response was successful",
      data: groupMeeting,
    });

    // notifications & emails
    Promise.all([
      // notify meeting creator
      Notification.create({
        userId: meetingCreator.id,
        type: notificationType,
        message: `${user.name} ${status} to attend group meeting at ${
          groupMeeting.location
        } from ${formatDateTime(groupMeeting.time_from)} to ${formatDateTime(
          groupMeeting.time_to
        )}`,
        groupId,
        meetingId,
      }),
      sendEmail({
        to: meetingCreator.email,
        subject: "Group Meeting Invite Response",
        message: `${user.name} has ${status} your meeting invite.`,
        html: `
          <p>${
            user.name
          } has <strong>${status}</strong> your group meeting invite.</p>
          <p>Time from: ${formatDateTime(groupMeeting.time_from)}</p>
          <p>Time to: ${formatDateTime(groupMeeting.time_to)}</p>
          <p>Location: ${groupMeeting.location}</p>
        `,
      }),
      // notify user
      Notification.create({
        userId: user.id,
        type: notificationType,
        message: `You have ${status} to attend the group meeting at ${
          groupMeeting.location
        } from ${formatDateTime(groupMeeting.time_from)} to ${formatDateTime(
          groupMeeting.time_to
        )}`,
        groupId,
        meetingId,
      }),
      sendEmail({
        to: user.email,
        subject: "Group Meeting Invite Response",
        message: `You have ${status} the meeting invite from ${meetingCreator.name}.`,
        html: `
          <p>You have <strong>${status}</strong> the meeting invite from ${
          meetingCreator.name
        }.</p>
          <p>Time from: ${formatDateTime(groupMeeting.time_from)}</p>
          <p>Time to: ${formatDateTime(groupMeeting.time_to)}</p>
          <p>Location: ${groupMeeting.location}</p>
        `,
      }),
    ]).catch((err) =>
      console.error("GroupMeetingResponse side effects failed:", err)
    );
  } catch (error) {
    await transaction.rollback();
    console.error("GroupMeetingResponse Error:", error);
    next(error);
  }
};

export const getGroupMeetings = async (req, res, next) => {
  try {
    // fetch all meetings with related group, creator, and invited users
    const meetings = await GroupMeeting.findAll({
      include: [
        {
          model: Group,
          as: "group",
          attributes: ["id", "name", "description"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
        {
          model: GroupMeetingInvite,
          as: "invited",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: meetings?.map((m) => m?.toJSON()),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getGroupMeetingsById = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    // fetch meeting with related group, creator, and invited users
    const meeting = await GroupMeeting.findByPk(meetingId, {
      include: [
        {
          model: Group,
          as: "group",
          attributes: ["id", "name", "description"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
        {
          model: GroupMeetingInvite,
          as: "invited",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting was not found",
      });
    }

    res.status(200).json({
      success: true,
      data: meeting?.toJSON(),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getGroupMeetingsByGroupId = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    // fetch all meetings for this group
    const meetings = await GroupMeeting.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
        {
          model: GroupMeetingInvite,
          as: "invited",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    if (!meetings || meetings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No meetings found for this group",
      });
    }

    res.status(200).json({
      success: true,
      data: meetings?.map((m) => m?.toJSON()),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
