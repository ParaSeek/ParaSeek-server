import { Server } from "socket.io";
import dotenv from 'dotenv';
dotenv.config();

let io;
export const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true, // Allow frontend access (adjust for production)
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("join", ({ chatId, username }) => {
      socket.join(chatId);
      console.log(`${username} joined room: ${chatId}`);
    });

    socket.on("newMessage", ({ chatId }) => {
      socket.emit("receiveMessage")
      socket.to(chatId).emit("receiveMessage");
    })

    socket.on("add-ice-candidate", ({ candidate, type, chatId }) => {
      socket.to(chatId).emit("add-ice-candidate", type, candidate)
    });
    socket.on("offer", ({ offer, callType, chatId }) => {
      socket.to(chatId).emit("offer", callType, offer);
    })

    socket.on("answer", ({ answer, chatId }) => {
      socket.to(chatId).emit("answer", answer);
    })

    socket.on("hangup", ({ chatId }) => {
      socket.to(chatId).emit("hangup");
    })

    socket.on("toggle-mic", ({ status, chatId }) => {
      socket.to(chatId).emit("toggle-mic", status);
    })
    socket.on("toggle-video", ({ status, chatId }) => {
      socket.to(chatId).emit("toggle-video", status);
    })

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

export { io };
