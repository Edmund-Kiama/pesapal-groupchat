import mongoose from "mongoose";

const groupInviteSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "declined"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const GroupInvite = mongoose.model("GroupInvite", groupInviteSchema);

export default GroupInvite;
