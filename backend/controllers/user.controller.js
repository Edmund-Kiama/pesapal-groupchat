import User from "../models/user.model.js";
import GroupMember from "../models/group-member.model.js";

//get all users
export const getUsers = async (req, res, next) => {
  try {
    //get all records
    const users = await User.find().select("-password");

    // return all records
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmins = async (req, res, next) => {
  try {
    //get all records
    const admins = await User.find({ role: "admin" }).select("-password");

    // return all records
    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

//get one user
export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User was not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    next(error);
  }
};

//list groups by userId --> all groups one user has
export const getUserGroups = async (req, res, next) => {
  try {
    //get the user Id
    const userId = req.params.userId;

    //find all group membership for the user
    const memberships = await GroupMember.find({ userId })
      .populate("groupId", "name description")
      .lean();

    const transformed = memberships.map((membership) => {
      const { groupId, ...rest } = membership;
      return { ...rest, group: groupId };
    });

    //return
    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};
