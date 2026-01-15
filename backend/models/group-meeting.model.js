import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";
import User from "./user.model.js";
import Group from "./group.model.js";

class GroupMeeting extends Model {}

GroupMeeting.init(
  {
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
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
    time_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time_to: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "GroupMeeting",
    tableName: "group_meetings",
    timestamps: true,
  }
);

export default GroupMeeting;
