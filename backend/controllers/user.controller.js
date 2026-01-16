import { User, GroupMember } from "../models/index.js";

//get all users
export const getUsers = async (req, res, next) => {
  try {
    // fetch all users, exclude password
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({
      success: true,
      data: users?.map((u) => u?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmins = async (req, res, next) => {
  try {
    // fetch all users with role 'admin', exclude password
    const admins = await User.findAll({
      where: { role: "admin" },
      attributes: { exclude: ["password"] },
    });

    // return response
    res.status(200).json({
      success: true,
      data: admins?.map((a) => a?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

//get one user
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // fetch user by primary key, exclude password
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User was not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
    
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//list groups by userId --> all groups one user has
export const getUserGroups = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // find all memberships for the user, including the group info
    const memberships = await GroupMember.findAll({
      where: { userId },
      include: [
        {
          model: Group,
          as: "group",
          attributes: ["id", "name", "description"],
        },
      ],
    })

    res.status(200).json({
      success: true,
      data: memberships?.map(m=>m?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

//delete user by id
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // check if user exists
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User was not found",
      });
    }

    // prevent self-deletion
    if (req.user && req.user.id === parseInt(userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // delete user (cascade will handle related records if configured)
    await user.destroy();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

