import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";
import User from "./user.model.js";
import Group from "./group.model.js";

class GroupChat extends Model {}

GroupChat.init(
  {
    content: {
      type: DataTypes.STRING(999),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 999],
      },
    },
    senderId: {
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
  },
  {
    sequelize,
    modelName: "GroupChat",
    tableName: "group_chats",
    timestamps: true,
  }
);

export default GroupChat;
