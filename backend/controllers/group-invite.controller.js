import GroupInvite from "../models/group-invite.model.js";
import GroupMember from "../models/group-member.model.js";
import sendEmail from "../utils/send-email.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";

export const createGroupInvite = async (req, res, next) => {
  try {
    const { receiverId, groupId } = req.body;
    const senderId = req.user._id; // from authentication middleware

    // check missing fields
    const missingFields = [];
    if (!receiverId) missingFields.push("receiverId");
    if (!groupId) missingFields.push("groupId");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    const user = await User.findById(receiverId);
    const group = await Group.findById(groupId);
    if (!user || !group) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
      });
    }

    // create the invite
    const groupInvite = await GroupInvite.create({
      receiverId,
      groupId,
      senderId,
    });

    await Promise.all([
      Notification.create({
        userId: receiverId,
        type: "GROUP_INVITE_CREATED",
        message: "You have been invited to join a group",
        metadata: { groupId, inviteId: groupInvite?._id },
      }),
      sendEmail({
        to: user?.email,
        subject: "Group Invitation",
        message: `You have been invited to join the group ${group?.name}`,
        html: `
       <p>You have been invited to join the group ${group?.name}. See below for details </p>
       <p>Group name: ${group?.name} </p>
       <p>Group description: ${group?.description} </p>
       <p>Please login for more details.</p>`,
      }),
    ]);

    // return
    res.status(201).json({
      success: true,
      message: "Group Invite created successfully",
      data: groupInvite,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const groupInviteResponse = async (req, res, next) => {
  try {
    const { groupInviteId, status } = req.body;
    const user = req.user;

    // check missing fields
    const missingFields = [];
    if (!groupInviteId) missingFields.push("groupInviteId");
    if (!status) missingFields.push("status");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // validate status
    const allowedStatuses = ["accepted", "declined"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    // update invite ONLY if still pending
    const updatedInvite = await GroupInvite.findOneAndUpdate(
      {
        _id: groupInviteId,
        status: "pending",
      },
      {
        $set: { status },
      },
      { new: true }
    )
      .populate("groupId", "name description")
      .populate("senderId", "email")
      .lean();

    if (!updatedInvite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found or already responded",
      });
    }

    let notificationType =
      status === "accepted" ? "GROUP_INVITE_ACCEPTED" : "GROUP_INVITE_DECLINED";

    // if accepted → add member + notify
    if (status === "accepted") {
      const existingMember = await GroupMember.findOne({
        userId: user._id,
        groupId: updatedInvite.groupId._id,
      });

      if (existingMember) {
        return res.status(409).json({
          success: false,
          message: "Member is already in the Group",
        });
      }

      await GroupMember.create({
        userId: user._id,
        groupId: updatedInvite.groupId._id,
        joined_at: Date.now(),
      });
    }

    const notifications = [
      //notify admin
      Notification.create({
        userId: updatedInvite.senderId,
        type: notificationType,
        message: `${user.name} has ${status} your group invite`,
        metadata: {
          groupId: updatedInvite.groupId._id,
          inviteId: updatedInvite._id,
        },
      }), // notify user
      Notification.create({
        userId: user._id,
        type: notificationType,
        message: `You have ${status} an invite to the group "${updatedInvite?.groupId?.name}"`,
        metadata: {
          groupId: updatedInvite.groupId._id,
          inviteId: updatedInvite._id,
        },
      }),
    ];

    const emails = [
      //email to admin
      sendEmail({
        to: updatedInvite?.senderId?.email,
        subject: "Group Invitation Response",
        message: `${user?.name} has ${status} to join the group ${updatedInvite?.groupId?.name}`,
        html: `
          <p>${user?.name} has <strong>${status}</strong> to join the group ${updatedInvite?.groupId?.name}. See below for details </p>
          <p>Group name: ${updatedInvite?.groupId?.name}</p>
          <p>Group description: ${updatedInvite?.groupId?.description} </p>
          <p>Please login for more details.</p>`,
      }),
      //email to user
      sendEmail({
        to: user?.email,
        subject: "Group Invitation Response",
        message: `You have ${status} an invite to join the group "${updatedInvite?.groupId?.name}"`,
        html: `
          <p>You have ${status} an invite to join the group "${updatedInvite?.groupId?.name}" See below for details </p>
          <p>Group name: ${updatedInvite?.groupId?.name}</p>
          <p>Group description: ${updatedInvite?.groupId?.description} </p>
          <p>Please login for more details.</p>`,
      }),
    ];

    await Promise.all([...notifications, ...emails]);

    res.status(200).json({
      success: true,
      message: "Group Invite updated successfully",
      data: updatedInvite,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


export const groupInviteSentBySender = async (req, res, next) => {
  try {
    const { senderId } = req.params;
    const invitesSent = await GroupInvite.find({ senderId })
      .populate("receiverId", "name")
      .populate("groupId", "name description")
      .lean();

    const transformed = invitesSent.map(({ receiverId, groupId, ...rest }) => ({
      ...rest,
      receiver: receiverId,
      group: groupId,
    }));

    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

export const groupInviteReceivedByReceiver = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const invitesReceived = await GroupInvite.find({ receiverId })
      .populate("senderId", "name")
      .populate("groupId", "name description")
      .lean();

    const transformed = invitesSent.map(({ senderId, groupId, ...rest }) => ({
      ...rest,
      sender: senderId,
      group: groupId,
    }));

    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};
