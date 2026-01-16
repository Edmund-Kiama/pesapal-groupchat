import sendEmail from "../utils/send-email.js";
import { Notification, GroupMember, User, Group } from "../models/index.js";
import { sequelize } from "../database/db.js";

export const createGroup = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, description } = req.body;
    const admin = req.user; // from authentication middleware

    const missingFields = [];
    if (!name) missingFields.push("name");

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // create the group
    const group = await Group.create(
      {
        name,
        description: description || "",
        created_by: admin.id,
      },
      { transaction }
    );

    // add creator as a group member
    await GroupMember.create(
      {
        userId: admin.id,
        groupId: group.id,
        joinedAt: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: group?.toJSON(),
    });

    // create notifications and send email
    Promise.all([
      Notification.create({
        userId: admin.id,
        type: "GROUP_CREATED",
        message: `You have created the group: "${group.name}"`,
        groupId: group.id,
      }),
      sendEmail({
        to: admin.email,
        subject: "Group Created",
        message: `New group has been created: ${name}`,
        html: `
          <p>You have created a new group: ${name}.</p>
          <p>The group's description has been saved as: ${description}</p>
          <p>Please continue by adding members to this new group.</p>
        `,
      }),
    ]).catch((err) =>
      console.error("Post-group-creation side effects failed:", err)
    );
  } catch (error) {
    await transaction.rollback();
    console.error("CreateGroup Error:", error);
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { users, groupId } = req.body;
    const admin = req.user;

    // validation
    const missingFields = [];
    if (!Array.isArray(users) || users.length === 0)
      missingFields.push("users");
    if (!groupId) missingFields.push("groupId");

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // fetch group
    const group = await Group.findByPk(groupId);
    if (!group) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // fetch users in bulk
    const validUsers = await User.findAll({
      where: { id: users },
      attributes: ["id", "name", "email"],
    });

    if (validUsers.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "No valid users found",
      });
    }

    const validUserIds = validUsers.map((u) => u.id);

    // find existing members
    const existingMembers = await GroupMember.findAll({
      where: {
        groupId,
        userId: validUserIds,
      },
      attributes: ["userId"],
    });

    const existingUserIds = new Set(existingMembers.map((m) => m.userId));

    // filter new members
    const newUsers = validUsers.filter((u) => !existingUserIds.has(u.id));

    if (newUsers.length === 0) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "All users are already members of this group",
      });
    }

    // insert group members
    await GroupMember.bulkCreate(
      newUsers.map((u) => ({
        userId: u.id,
        groupId,
        joinedAt: new Date(),
      })),
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Members added successfully",
      addedCount: newUsers.length,
      skippedCount: existingUserIds.size,
    });

    // notifications
    const notifications = [
      {
        userId: admin.id,
        type: "GROUP_MEMBER_ADDED",
        message: `You added ${newUsers.length} member(s) to the group "${group.name}"`,
        metadata: JSON.stringify({ groupId }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ...newUsers.map((u) => ({
        userId: u.id,
        type: "GROUP_MEMBER_ADDED",
        message: `You were added to the group "${group.name}"`,
        metadata: JSON.stringify({ groupId }),
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    ];

    Notification.bulkCreate(notifications).catch((err) =>
      console.error("AddMember notification creation failed:", err)
    );

    // emails (parallel)
    Promise.all(
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
    ).catch((err) => console.error("AddMember email sending failed:", err));
  } catch (error) {
    await transaction.rollback();
    console.error("AddMember Error:", error);
    next(error);
  }
};

export const getGroups = async (req, res, next) => {
  try {
    // Fetch all groups
    const groups = await Group.findAll({
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
      ],
    });

    // Return all records
    res.status(200).json({
      success: true,
      data: groups.map((g) => g.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};


export const getMemberships = async (req, res, next) => {
  try {
    // get all group members with associated user and group
    const members = await GroupMember.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: Group,
          as: "group",
          attributes: ["id", "name", "description", "created_by"],
        },
      ],
    });

    if (members?.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No memberships found",
      });
    }

    // Get member counts for each group
    const groupIds = [...new Set(members.map((m) => m.groupId))];
    const memberCounts = await GroupMember.findAll({
      where: { groupId: groupIds },
      attributes: [
        "groupId",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["groupId"],
    });

    const countMap = {};
    memberCounts.forEach((row) => {
      countMap[row.groupId] = row.dataValues.count;
    });

    // Enrich each membership with member count
    const enrichedData = members.map((m) => {
      const json = m.toJSON();
      json.group = json.group || {};
      json.group.memberCount = countMap[m.groupId] || 0;
      return json;
    });

    // return
    res.status(200).json({
      success: true,
      data: enrichedData,
    });
  } catch (error) {
    next(error);
  }
};

export const getGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["name"],
        },
      ],
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group was not found",
      });
    }

    res.status(200).json({
      success: true,
      data: group?.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

//list users by groupId --> all users one group has
export const getGroupUsers = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    // fetch group members with their associated users
    const memberships = await GroupMember.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    // extract users
    const users = memberships.map((m) => m.user);

    res.status(200).json({
      success: true,
      data: users?.map((u) => u?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

// Delete a group (only creator can delete)
export const deleteGroup = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    // Fetch the group
    const group = await Group.findByPk(groupId);
    if (!group) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is the creator
    if (group.created_by !== userId) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Only the group creator can delete this group",
      });
    }

    // Delete related records (cascade)
    // Delete group meetings first
    const { GroupMeeting, GroupChat, GroupInvite, Notification } = await import(
      "../models/index.js"
    );

    await GroupMeeting.destroy({ where: { groupId }, transaction });
    await GroupChat.destroy({ where: { groupId }, transaction });
    await GroupInvite.destroy({ where: { groupId }, transaction });
    await Notification.destroy({ where: { groupId }, transaction });
    await GroupMember.destroy({ where: { groupId }, transaction });

    // Delete the group
    await Group.destroy({ where: { id: groupId }, transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("DeleteGroup Error:", error);
    next(error);
  }
};

// Leave a group (non-creator members only)
export const leaveGroup = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    // Fetch the group
    const group = await Group.findByPk(groupId);
    if (!group) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is the creator - creators cannot leave, they must delete
    if (group.created_by === userId) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Group creators cannot leave. Please delete the group instead.",
      });
    }

    // Find the membership
    const membership = await GroupMember.findOne({
      where: { userId, groupId },
    });

    if (!membership) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Delete the membership
    await membership.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "You have left the group successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("LeaveGroup Error:", error);
    next(error);
  }
};
