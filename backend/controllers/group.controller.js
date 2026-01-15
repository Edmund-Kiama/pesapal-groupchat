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
    if (!description) missingFields.push("description");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // create the group
    const group = await Group.create(
      {
        name,
        description,
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

    // create notifications and send email
    await Promise.all([
      Notification.create({
        userId: admin.id,
        type: "GROUP_CREATED",
        message: `You have created the group: "${group.name}"`,
        groupId: group.id 
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
    ]);

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: group?.toJSON(),
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
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
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // fetch group
    const group = await Group.findByPk(groupId);
    if (!group) {
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

    await Notification.bulkCreate(notifications);

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
    await transaction.rollback();
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
          attributes:["id", "name", "email", "role"],
        },
        {
          model: Group,
          as: "group", 
          attributes: ["id", "name", "description"]
        },
      ],
    });

    if(members?.length === 0 ) {
      return res.status(200).json({
        success: true,
        message: "No memberships found"
      })
    }

    // return
    res.status(200).json({
      success: true,
      data: members?.map(m=>m?.toJSON()),
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
          as: "created_by", 
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
      data: users?.map(u => u?.toJSON()),
    });

  } catch (error) {
    next(error);
  }
};
