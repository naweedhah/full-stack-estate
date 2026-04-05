import { Server } from "socket.io";

let io;

export const initSocketServer = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("newUser", (userId) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
    });

    socket.on("sendMessage", ({ receiverId, data }) => {
      if (!receiverId || !data) return;
      io.to(`user:${receiverId}`).emit("getMessage", data);
    });
  });

  return io;
};

export const getIO = () => io;

export const emitNotificationToUser = (userId, notification) => {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit("notification:new", notification);
};

export const emitNotificationRead = (userId, notificationId) => {
  if (!io || !userId || !notificationId) return;
  io.to(`user:${userId}`).emit("notification:read", { notificationId });
};
