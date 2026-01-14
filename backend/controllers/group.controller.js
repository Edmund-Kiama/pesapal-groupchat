import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import sendEmail from "../utils/send-email.js";
import GroupMember from "../models/group-member.model.js";
import Notification from "../models/notification.model.js";

export const createGroup = async (req, res, next) => {
  try {
    //destructure
    const { name, description } = req.body;
    const admin = req.user; // from authentication middleware

    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    //create the group
    const group = await Group.create({
      name,
      description,
      created_by: admin._id,
    });

    //create the group member
    await GroupMember.create({
      userId: admin._id,
      groupId: group?._id,
      joined_at: Date.now(),
    });

    await Promise.all([
      Notification.create({
        userId: admin._id,
        type: "GROUP_CREATED",
        message: `You have created the group: "${group?.name}"`,
        metadata: { groupId: group?._id },
      }),
      sendEmail({
        to: admin?.email,
        subject: "Group Created",
        message: `New group has been created: ${name}`,
        html: `
          <p>You have created a new group: ${name}.</p>
          <p>The group's description has been saved as: ${description}</p>
          <p>Please continue by adding members to this new group.</p>
        `,
      }),
    ]);

    //return
    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    //destructure
    const { users, groupId } = req.body;
    const admin = req.user;

    // validation
    const missingFields = [];
    if (!Array.isArray(users) || users.length === 0)
      missingFields.push("users");
    if (!groupId) missingFields.push("groupId");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // fetch group
    const group = await Group.findById(groupId).select("name");
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // fetch users in bulk
    const validUsers = await User.find({ _id: { $in: users } })
      .select("name email")
      .lean();

    if (validUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid users found",
      });
    }
    const validUserIds = validUsers.map((u) => u._id);

    // find existing members
    const existingMembers = await GroupMember.find({
      groupId,
      userId: { $in: validUserIds },
    }).select("userId");

    const existingUserIds = new Set(
      existingMembers.map((m) => m.userId.toString())
    );

    // filter new members
    const newUsers = validUsers.filter(
      (u) => !existingUserIds.has(u._id.toString())
    );

    if (newUsers.length === 0) {
      return res.status(409).json({
        success: false,
        message: "All users are already members of this group",
      });
    }

    // insert group members
    await GroupMember.insertMany(
      newUsers.map((u) => ({
        userId: u._id,
        groupId,
      }))
    );
    // notifications
    const notifications = [
      {
        userId: admin._id,
        type: "GROUP_MEMBER_ADDED",
        message: `You added ${newUsers.length} member(s) to the group "${group.name}"`,
        metadata: { groupId },
      },
      ...newUsers.map((u) => ({
        userId: u._id,
        type: "GROUP_MEMBER_ADDED",
        message: `You were added to the group "${group.name}"`,
        metadata: { groupId },
      })),
    ];

    await Notification.insertMany(notifications);

    // emails (parallel)
    await Promise.all(
      newUsers.map((u) =>
        sendEmail({
          to: u.email,
          subject: "Added to a Group",
          message: `You have been added to the group ${group.name} by ${admin.name}`,
          html: `
            <p>Welcome to the group: <strong>${group.name}</strong>.</p>
            <p>You were added by ${admin.name}.</p>
            <p>You can now participate in group activities.</p>
          `,
        })
      )
    );

    res.status(200).json({
      success: true,
      message: "Members added successfully",
      addedCount: newUsers.length,
      skippedCount: existingUserIds.size,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemberships = async (req, res, next) => {
  try {
    //get all records
    const members = await GroupMember.find()
      .populate("userId", "-password")
      .populate("groupId")
      .lean();

    const transformed = members.map((member) => {
      const { userId, groupId, ...rest } = member;
      return { ...rest, user: userId, group: groupId };
    });

    //return all records
    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

export const getGroups = async (req, res, next) => {
  try {
    //get all records
    const groups = await Group.find().populate("created_by", "name");

    // return all records
    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    next(error);
  }
};

export const getGroupById = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId).populate("created_by", "name");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group was not found",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

//list users by groupId --> all users one group has
export const getGroupUsers = async (req, res, next) => {
  try {
    //get the group Id
    const groupId = req.params.groupId;

    //find all user membership for the group
    const memberships = await GroupMember.find({ groupId }).populate(
      "userId",
      "name email role"
    );

    //extract the users
    const users = memberships.map((m) => m.userId);

    //return
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
 