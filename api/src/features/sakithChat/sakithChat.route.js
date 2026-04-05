import express from "express";
import {
  createChat,
  sendMessage,
  getMessages
} from "./sakithChat.controller.js";
import { verifyToken } from "../../shared/middleware/verifyToken.js";

const router = express.Router();

router.post("/create", verifyToken, createChat);
router.post("/send", verifyToken, sendMessage);
router.get("/:chatId", verifyToken, getMessages);

export default router;
