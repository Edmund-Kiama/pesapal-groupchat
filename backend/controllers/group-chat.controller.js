import { sequelize } from "../database/db.js";
import { GroupChat, Group, User, Notification } from "../models/index.js";

export const sendChat = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    // Destructure request body
    const { content, groupId } = req.body;
    const senderId = req.user.id; 

    const missingFields = [];
    if (!content) missingFields.push("content");
    if (!groupId) missingFields.push("groupId");

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // Create the chat
    const chat = await GroupChat.create(
      {
        content,
        senderId,
        groupId,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Chat created successfully",
      data: chat?.toJSON(),
    });

    Notification.create({
      userId: senderId,
      type: "GROUP_CHAT",
      message: content,
      groupId,
    }).catch((err) =>
      console.error("SendChat notification creation failed:", err)
    );
  } catch (error) {
    await transaction.rollback();
    console.error("SendChat Error:", error);
    next(error);
  }
};

export const getChatById = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;

    // Fetch chat by primary key with associations
    const chat = await GroupChat.findByPk(chatId, {
      include: [
        { model: Group, as: "group", attributes: ["id", "name"] }, // include group info
        { model: User, as: "sender", attributes: ["id", "name", "role"] }, // include sender info
      ],
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.status(200).json({
      success: true,
      data: chat?.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const getChatByGroupId = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;

    // Fetch all chats for the group with sender info
    const groupChats = await GroupChat.findAll({
      where: { groupId },
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "role"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    // Return empty array if no chats found (not an error)
    res.status(200).json({
      success: true,
      data: groupChats?.map((gc) => gc?.toJSON()) || [],
    });
  } catch (error) {
    next(error);
  }
};

export const getChatByUserId = async (req, res, next) => {
  try {
    const senderId = req.params.userId;

    // Fetch all chats sent by this user, include the group info
    const userChats = await GroupChat.findAll({
      where: { senderId },
      include: [{ model: Group, as: "group", attributes: ["id", "name"] }],
      order: [["createdAt", "ASC"]],
    });

    if (userChats.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User Chat not found",
      });
    }

    res.status(200).json({
      success: true,
      data: userChats?.map((uc) => uc?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Find the chat
    const chat = await GroupChat.findByPk(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Only the sender can delete their own chat
    if (chat.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    // Delete the chat
    await chat.destroy();

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
