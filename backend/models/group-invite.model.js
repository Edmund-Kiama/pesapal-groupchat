import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";
import User from "./user.model.js";
import Group from "./group.model.js";

class GroupInvite extends Model {}

GroupInvite.init(
  {
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Group,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "declined"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "GroupInvite",
    tableName: "group_invites",
    timestamps: true,
  }
);

// Associations
User.hasMany(GroupInvite, { foreignKey: "senderId", as: "SentInvites" });
User.hasMany(GroupInvite, { foreignKey: "receiverId", as: "ReceivedInvites" });
GroupInvite.belongsTo(User, { foreignKey: "senderId", as: "Sender" });
GroupInvite.belongsTo(User, { foreignKey: "receiverId", as: "Receiver" });

Group.hasMany(GroupInvite, { foreignKey: "groupId" });
GroupInvite.belongsTo(Group, { foreignKey: "groupId" });

export default GroupInvite;
