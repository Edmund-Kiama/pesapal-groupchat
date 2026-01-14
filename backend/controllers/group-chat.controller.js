import GroupChat from "../models/group-chat.model.js";

export const sendChat = async (req, res, next) => {
  try {
    //destructure
    const { content, groupId } = req.body;
    const senderId = req.user._id; // from authentication mIddleware

    const missingFields = [];
    if (!content) missingFields.push("content");
    if (!groupId) missingFields.push("groupId");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    //create the chat
    const chat = await GroupChat.create({
      content,
      senderId,
      groupId,
    });

    //return
    res.status(201).json({
      success: true,
      message: "Chat created successfully",
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};

export const getChatById = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const chat = await GroupChat.findById(chatId)
      .populate("groupId", "name")
      .populate("senderId", "name role")
      .lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // rename groupId → group
    const { groupId, senderId, ...rest } = chat;
    const transformed = { ...rest, sender: senderId, group: groupId };

    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

export const getChatByGroupId = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const groupChat = await GroupChat.find({ groupId })
      .populate("senderId", "name role")
      .lean();

    if (!groupChat) {
      return res.status(404).json({
        success: false,
        message: "Group Chat not found",
      });
    }

    const transformed = groupChat.map(({ senderId, ...rest }) => ({
      ...rest,
      sender: senderId,
    }));

    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

export const getChatByUserId = async (req, res, next) => {
  try {
    const senderId = req.params.userId;
    const userChat = await GroupChat.find({ senderId })
      .populate("groupId", "name")
      .lean();

    if (!userChat) {
      return res.status(404).json({
        success: false,
        message: "User Chat not found",
      });
    }

    const transformed = userChat.map(({ groupId, ...rest }) => ({
      ...rest,
      group: groupId,
    }));

    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};
