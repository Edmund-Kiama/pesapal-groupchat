import Candidate from "./candidate.model.js";
import Election from "./election.model.js";
import GroupChat from "./group-chat.model.js";
import GroupInvite from "./group-invite.model.js";
import GroupMeetingInvite from "./group-meeting-invite.model.js";
import GroupMeeting from "./group-meeting.model.js";
import GroupMember from "./group-member.model.js";
import Group from "./group.model.js";
import Notification from "./notification.model.js";
import Position from "./position.model.js";
import User from "./user.model.js";
import Vote from "./vote.model.js";
import VotingRight from "./voting-right.model.js";

// --------------------
// USER RELATIONS
// --------------------
User.hasMany(VotingRight, { foreignKey: "userId" });
VotingRight.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Candidate, { foreignKey: "userId" });
Candidate.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Group, { foreignKey: "created_by" });
Group.belongsTo(User, { foreignKey: "created_by" });

User.hasMany(GroupMember, { foreignKey: "userId" });
GroupMember.belongsTo(User, { foreignKey: "userId" });

// GroupInvite sender & receiver
User.hasMany(GroupInvite, { foreignKey: "senderId", as: "sentInvites" });
User.hasMany(GroupInvite, { foreignKey: "receiverId", as: "receivedInvites" });
GroupInvite.belongsTo(User, { foreignKey: "senderId", as: "sender" });
GroupInvite.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

// GroupChat sender
User.hasMany(GroupChat, { foreignKey: "senderId" });
GroupChat.belongsTo(User, { foreignKey: "senderId" });

// User ↔ Vote (voter)
User.hasMany(Vote, { foreignKey: "userId" });
Vote.belongsTo(User, { foreignKey: "userId" });

// User ↔ Position created
User.hasMany(Position, { foreignKey: "created_by" });
Position.belongsTo(User, { foreignKey: "created_by" });

// User ↔ Election created
User.hasMany(Election, { foreignKey: "created_by" });
Election.belongsTo(User, { foreignKey: "created_by" });

// User ↔ Notification
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

// User ↔ GroupMeeting created
User.hasMany(GroupMeeting, { foreignKey: "created_by" });
GroupMeeting.belongsTo(User, { foreignKey: "created_by" });

// User ↔ GroupMeetingInvite
User.hasMany(GroupMeetingInvite, { foreignKey: "userId" });
GroupMeetingInvite.belongsTo(User, { foreignKey: "userId" });

// --------------------
// GROUP RELATIONS
// --------------------
Group.hasMany(GroupMember, { foreignKey: "groupId" });
GroupMember.belongsTo(Group, { foreignKey: "groupId" });

Group.hasMany(GroupInvite, { foreignKey: "groupId" });
GroupInvite.belongsTo(Group, { foreignKey: "groupId" });

Group.hasMany(GroupChat, { foreignKey: "groupId" });
GroupChat.belongsTo(Group, { foreignKey: "groupId" });

Group.hasMany(Election, { foreignKey: "groupId" });
Election.belongsTo(Group, { foreignKey: "groupId" });

Group.hasMany(GroupMeeting, { foreignKey: "groupId" });
GroupMeeting.belongsTo(Group, { foreignKey: "groupId" });

// --------------------
// ELECTION RELATIONS
// --------------------
Election.hasMany(Position, { foreignKey: "electionId" });
Position.belongsTo(Election, { foreignKey: "electionId" });

Election.hasMany(Candidate, { foreignKey: "electionId" });
Candidate.belongsTo(Election, { foreignKey: "electionId" });

Election.hasMany(Vote, { foreignKey: "electionId" });
Vote.belongsTo(Election, { foreignKey: "electionId" });

// --------------------
// POSITION RELATIONS
// --------------------
Position.hasMany(Candidate, { foreignKey: "positionId" });
Candidate.belongsTo(Position, { foreignKey: "positionId" });

Position.hasMany(Vote, { foreignKey: "positionId" });
Vote.belongsTo(Position, { foreignKey: "positionId" });

// --------------------
// CANDIDATE RELATIONS
// --------------------
Candidate.hasMany(Vote, { foreignKey: "candidateId" });
Vote.belongsTo(Candidate, { foreignKey: "candidateId" });

// --------------------
// GROUP MEETING RELATIONS
// --------------------
GroupMeeting.hasMany(GroupMeetingInvite, { foreignKey: "meetingId" });
GroupMeetingInvite.belongsTo(GroupMeeting, { foreignKey: "meetingId" });

// --------------------
// GROUP MEETING INVITE RELATIONS
// (already linked above)
// --------------------

// --------------------
// EXPORT ALL MODELS
// --------------------
export {
  User,
  VotingRight,
  Group,
  GroupMember,
  GroupInvite,
  GroupChat,
  GroupMeeting,
  GroupMeetingInvite,
  Election,
  Position,
  Candidate,
  Vote,
  Notification,
};
