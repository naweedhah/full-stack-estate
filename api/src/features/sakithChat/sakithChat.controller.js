const detectScam = require("../safety/scamDetector");

let chats = [];
let messages = [];

// CREATE CHAT AFTER INQUIRY
exports.createChat = (req, res) => {
  const { inquiryId, studentId, ownerId } = req.body;

  const chat = {
    id: "chat_" + Date.now(),
    inquiryId,
    users: [studentId, ownerId],
    createdAt: new Date()
  };

  chats.push(chat);

  res.json(chat);
};

// SEND MESSAGE
exports.sendMessage = (req, res) => {
  const { chatId, senderId, text } = req.body;

  const scamFlag = detectScam(text);

  const message = {
    id: Date.now().toString(),
    chatId,
    senderId,
    text,
    scamFlag,
    createdAt: new Date()
  };

  messages.push(message);

  res.json(message);
};

// GET MESSAGES
exports.getMessages = (req, res) => {
  const { chatId } = req.params;

  const chatMessages = messages.filter(m => m.chatId === chatId);

  res.json(chatMessages);
};