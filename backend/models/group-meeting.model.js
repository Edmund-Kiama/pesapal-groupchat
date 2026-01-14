import mongoose from "mongoose";

const groupMeetingSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invited: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
      },
    ],
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    time: {
      to: {
        type: Date,
        required: [true, "Time to is required"],
      },
      from: {
        type: Date,
        required: [true, "Time from is required"],
      },
    },
  },
  { timestamps: true }
);

const GroupMeeting = mongoose.model("GroupMeeting", groupMeetingSchema);

export default GroupMeeting;
