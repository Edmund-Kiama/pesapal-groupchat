import Router from "express";
import {
  sendChat,
  getChatByGroupId,
  getChatById,
  getChatByUserId,
} from "../controllers/group-chat.controller.js";

const groupChatRouter = Router();

// --> /api/v1/group-chat
groupChatRouter.post("/", sendChat);
groupChatRouter.get("/:chatId", getChatById);
groupChatRouter.get("/group/:groupId", getChatByGroupId);
groupChatRouter.get("/user/:userId", getChatByUserId);

export default groupChatRouter;
