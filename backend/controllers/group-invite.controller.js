import {
  GroupInvite,
  GroupMember,
  User,
  Group,
  Notification,
} from "../models/index.js";
import { sequelize } from "../database/db.js";
import sendEmail from "../utils/send-email.js";

export const createGroupInvite = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { receiverId, groupId } = req.body;
    const senderId = req.user.id; // from authentication middleware

    // check missing fields
    const missingFields = [];
    if (!receiverId) missingFields.push("receiverId");
    if (!groupId) missingFields.push("groupId");

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // verify user and group exist
    const user = await User.findByPk(receiverId);
    const group = await Group.findByPk(groupId);

    if (!user || !group) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
      });
    }

    // create the invite
    const groupInvite = await GroupInvite.create(
      {
        receiverId,
        groupId,
        senderId,
      },
      { transaction }
    );
    await transaction.commit();

    // return
    res.status(201).json({
      success: true,
      message: "Group Invite created successfully",
      data: groupInvite?.toJSON(),
    });

    // notifications and email
    Promise.all([
      Notification.create({
        userId: receiverId,
        type: "GROUP_INVITE_CREATED",
        message: "You have been invited to join a group",
        groupId,
        inviteId: groupInvite.id,
      }),
      sendEmail({
        to: user.email,
        subject: "Group Invitation",
        message: `You have been invited to join the group ${group.name}`,
        html: `
          <p>You have been invited to join the group <strong>${group.name}</strong>. See below for details:</p>
          <p>Group name: ${group.name}</p>
          <p>Group description: ${group.description}</p>
          <p>Please login for more details.</p>
        `,
      }),
    ]).catch((err) =>
      console.error("CreateGroupInvite side effects failed:", err)
    );
  } catch (error) {
    await transaction.rollback();
    console.error("CreateGroupInvite Error:", error);
    next(error);
  }
};

export const groupInviteResponse = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { groupInviteId, status } = req.body;
    const userId = req.user.id; // from authentication middleware

    // check missing fields
    const missingFields = [];
    if (!groupInviteId) missingFields.push("groupInviteId");
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

    // update invite ONLY if still pending
    const updatedInvite = await GroupInvite.findOne({
      where: { id: groupInviteId, status: "pending" },
      include: [
        { model: Group, as: "group", attributes: ["name", "description"] },
        { model: User, as: "sender", attributes: ["email", "id"] },
      ],
    });

    if (!updatedInvite) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Invite not found or already responded",
      });
    }

    // update status
    updatedInvite.status = status;
    await updatedInvite.save({ transaction });

    const notificationType =
      status === "accepted" ? "GROUP_INVITE_ACCEPTED" : "GROUP_INVITE_DECLINED";

    // if accepted → add member + notify
    if (status === "accepted") {
      const existingMember = await GroupMember.findOne({
        where: { userId, groupId: updatedInvite.groupId },
      });

      if (existingMember) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: "Member is already in the Group",
        });
      }

      await GroupMember.create(
        {
          userId,
          groupId: updatedInvite.groupId,
          joined_at: new Date(),
        },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Group Invite updated successfully",
      data: updatedInvite?.toJSON(),
    });

    // notifications
    const notifications = [
      Notification.create({
        userId: updatedInvite.senderId,
        type: notificationType,
        message: `${req.user.name} has ${status} your group invite`,
        groupId: updatedInvite.groupId,
        inviteId: updatedInvite.id,
      }),
      Notification.create({
        userId,
        type: notificationType,
        message: `You have ${status} an invite to the group "${updatedInvite.group.name}"`,
        groupId: updatedInvite.groupId,
        inviteId: updatedInvite.id,
      }),
    ];

    // emails
    const emails = [
      sendEmail({
        to: updatedInvite.sender.email,
        subject: "Group Invitation Response",
        message: `${req.user.name} has ${status} to join the group ${updatedInvite.group.name}`,
        html: `
          <p>${req.user.name} has <strong>${status}</strong> to join the group ${updatedInvite.group.name}</p>
          <p>Group name: ${updatedInvite.group.name}</p>
          <p>Group description: ${updatedInvite.group.description}</p>
          <p>Please login for more details.</p>
        `,
      }),
      sendEmail({
        to: req.user.email,
        subject: "Group Invitation Response",
        message: `You have ${status} an invite to join the group "${updatedInvite.group.name}"`,
        html: `
          <p>You have ${status} an invite to join the group "${updatedInvite.group.name}"</p>
          <p>Group name: ${updatedInvite.group.name}</p>
          <p>Group description: ${updatedInvite.group.description}</p>
          <p>Please login for more details.</p>
        `,
      }),
    ];

    Promise.all([...notifications, ...emails]).catch((err) =>
      console.error("GroupInviteResponse side effects failed:", err)
    );
  } catch (error) {
    await transaction.rollback();
    console.error("GroupInviteResponse Error:", error);
    next(error);
  }
};

export const groupInviteSentBySender = async (req, res, next) => {
  try {
    const { senderId } = req.params;

    // fetch all invites sent by this sender
    const invitesSent = await GroupInvite.findAll({
      where: { senderId },
      include: [
        {
          model: User,
          as: "receiver",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: Group,
          as: "group",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: invitesSent?.map((is) => is?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

export const groupInviteReceivedByReceiver = async (req, res, next) => {
  try {
    const { receiverId } = req.params;

    // fetch all invites received by this user
    const invitesReceived = await GroupInvite.findAll({
      where: { receiverId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: Group,
          as: "group",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: invitesReceived?.map((ir) => ir?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};
