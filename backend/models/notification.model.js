import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
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
        "ADMIN_CREATION",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    // reference to related entity (optional)
    metadata: {
      groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
      meetingId: { type: mongoose.Schema.Types.ObjectId, ref: "GroupMeeting" },
      inviteId: { type: mongoose.Schema.Types.ObjectId, ref: "GroupInvite" },
      positionId: { type: mongoose.Schema.Types.ObjectId, ref: "Position" },
      electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election" },
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
