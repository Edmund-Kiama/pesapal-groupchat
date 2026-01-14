import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db.js";
import User from "./user.model.js";
import Group from "./group.model.js";
import GroupMeeting from "./group-meeting.model.js";
import GroupInvite from "./group-invite.model.js";
import Position from "./position.model.js";
import Election from "./election.model.js";

class Notification extends Model {}

Notification.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM(
        "GROUP_CREATED",
        "GROUP_MEMBER_ADDED",
        "GROUP_INVITE_CREATED",
        "GROUP_INVITE_DECLINED",
        "GROUP_INVITE_ACCEPTED",
        "GROUP_MEETING_CREATED",
        "GROUP_MEETING_INVITATION",
        "GROUP_MEETING_ACCEPTED",
        "GROUP_MEETING_DECLINED",
        "POSITION_CREATED",
        "POSITION_DELETED",
        "ELECTION_CREATED",
        "ELECTION_DELETED",
        "CANDIDATE_NOMINATED",
        "USER_CREATION",
        "ADMIN_CREATION"
      ),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Group,
        key: "id",
      },
    },
    meetingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GroupMeeting,
        key: "id",
      },
    },
    inviteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: GroupInvite,
        key: "id",
      },
    },
    positionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Position,
        key: "id",
      },
    },
    electionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Election,
        key: "id",
      },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    timestamps: true,
  }
);

// Associations
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

Group.hasMany(Notification, { foreignKey: "groupId" });
Notification.belongsTo(Group, { foreignKey: "groupId" });

GroupMeeting.hasMany(Notification, { foreignKey: "meetingId" });
Notification.belongsTo(GroupMeeting, { foreignKey: "meetingId" });

GroupInvite.hasMany(Notification, { foreignKey: "inviteId" });
Notification.belongsTo(GroupInvite, { foreignKey: "inviteId" });

Position.hasMany(Notification, { foreignKey: "positionId" });
Notification.belongsTo(Position, { foreignKey: "positionId" });

Election.hasMany(Notification, { foreignKey: "electionId" });
Notification.belongsTo(Election, { foreignKey: "electionId" });

export default Notification;
