import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";
import User from "./user.model.js";
import GroupMeeting from "./group-meeting.model.js";

class GroupMeetingInvite extends Model {}

GroupMeetingInvite.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    meetingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: GroupMeeting,
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
    modelName: "GroupMeetingInvite",
    tableName: "group_meeting_invites",
    timestamps: true,
  }
);

// Associations
User.hasMany(GroupMeetingInvite, { foreignKey: "userId" });
GroupMeetingInvite.belongsTo(User, { foreignKey: "userId" });

GroupMeeting.hasMany(GroupMeetingInvite, { foreignKey: "meetingId" });
GroupMeetingInvite.belongsTo(GroupMeeting, { foreignKey: "meetingId" });

export { GroupMeeting, GroupMeetingInvite };
