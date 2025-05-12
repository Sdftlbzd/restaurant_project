import { Server, Socket } from "socket.io";
import { Message } from "../DAL/models/Message.model";
import { ChatRoom } from "../DAL/models/ChatRoom.model";
import { User } from "../DAL/models/User.model";
import { AuthRequest } from "../types";

export const registerChatHandlers = async (
  socket: Socket & { user?: User },
  io: Server
) => {
  try {
    const user = socket.user;

    if (!user) {
      socket.emit("error", { message: "Unauthorized" });
      return;
    }
    const dbUser = await User.findOneBy({ id: user.id });
    if (!dbUser) {
      socket.emit("error", { message: "User not found" });
      return;
    }

    // Otağa qoşul
    socket.on("joinRoom", async ({ roomId }) => {
      try {
        const room = await ChatRoom.findOneBy({ id: roomId });
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      } catch (err) {
        console.error("joinRoom error:", err);
      }
    });

    // Mesaj göndər
    socket.on("sendMessage", async ({ roomId, content, isCustomer }) => {
      try {
        const room = await ChatRoom.findOneBy({ id: roomId });
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        if (typeof content !== "string" || content.trim() === "") {
          socket.emit("error", { message: "Invalid content" });
          return;
        }

        const message = new Message();
        message.content = content.trim();
        message.room = room;
        message.customer = isCustomer ? dbUser : (null as unknown as User);
        message.staff = !isCustomer ? dbUser : (null as unknown as User);

        await Message.save(message);

        io.to(roomId).emit("newMessage", {
          id: message.id,
          content: message.content,
          senderId: dbUser.id,
          createdAt: message.created_at,
        });
      } catch (err) {
        console.error("sendMessage error:", err);
        socket.emit("error", { message: "Message could not be sent" });
      }
    });

    // Mesajı oxundu kimi işarələ
    socket.on("markAsRead", async ({ messageId }) => {
      try {
        const message = await Message.findOne({
          where: { id: messageId },
          relations: ["room"],
        });
        if (!message) return;

        message.read = true;
        await Message.save(message);

        io.to(String(message.room.id)).emit("messageRead", {
          messageId: message.id,
        });
      } catch (err) {
        console.error("markAsRead error:", err);
      }
    });

    socket.on("typing", ({ roomId }) => {
      socket.to(roomId).emit("isTyping", { userId: dbUser.id });
    });

    socket.on("stopTyping", ({ roomId }) => {
      socket.to(roomId).emit("stoppedTyping", { userId: dbUser.id });
    });
  } catch (err) {
    console.error("registerChatHandlers error:", err);
    socket.emit("error", { message: "Internal error" });
  }
};
