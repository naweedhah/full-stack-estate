import prisma from "../../shared/lib/prisma.js";
import detectScam from "../safety/scamDetector.js";
import { notifySuspiciousChatActivity } from "../../shared/services/notification.service.js";

export const addMessage = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.chatId;
  const text = req.body.text?.trim();

  if (!text) {
    return res.status(400).json({ message: "Message text is required" });
  }

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    const scamFlag = detectScam(text);

    const message = await prisma.message.create({
      data: {
        text,
        chatId,
        userId: tokenUserId,
        scamFlag,
      },
    });

    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: [tokenUserId],
        lastMessage: text,
      },
    });

    const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

    await notifySuspiciousChatActivity({
      receiverId,
      senderId: tokenUserId,
      chatId,
      messageId: message.id,
      scamFlag,
      text,
    });

    res.status(200).json(message);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add message!" });
  }
};
