import { Response } from "express";
import { Message } from "../../../DAL/models/Message.model";
import { AuthRequest } from "../../../types";
import { ChatRoom } from "../../../DAL/models/ChatRoom.model";
import { ERoleType } from "../../app/enums";

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { roomId, content, role } = req.body;

    if (!content || !roomId || !role) {
      res.status(400).json({ message: "Missing fields" });
      return;
    }

    const room = await ChatRoom.findOne({ where: { id: roomId } });
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    const message = new Message();
    message.content = content;
    message.room = room;

    if (role === ERoleType.CUSTOMER) {
      message.customer = user;
    } else if (role === ERoleType.STAFF || role === ERoleType.ADMIN) {
      message.staff = user;
    } else {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    await message.save();

    // 🔥 SOCKET İLƏ MƏLUMATI OTAĞA GÖNDƏR
    const io = req.app.get("io");
    io.to(roomId.toString()).emit("receiveMessage", {
      id: message.id,
      content: message.content,
      roomId,
      senderId: user.id,
      role,
      createdAt: message.created_at,
    });

    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const getMessagesByRoomId = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const roomId = Number(req.params.id);

    const messages = await Message.find({
      where: { room: { id: roomId }, customer: { id: user.id } },
      order: { created_at: "ASC" },
      relations: ["customer", "staff"],
    });

    res.json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const MessageController = () => ({
  sendMessage,
  getMessagesByRoomId,
});
