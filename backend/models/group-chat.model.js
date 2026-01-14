import mongoose from "mongoose";

const groupChatSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minLength: 1,
      maxLength: 999,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
  },
  { timestamps: true }
);

const GroupChat = mongoose.model("GroupChat", groupChatSchema);

export default GroupChat;
