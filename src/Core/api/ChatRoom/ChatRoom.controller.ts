import { NextFunction, Request, Response } from "express";
import { ChatRoom } from "../../../DAL/models/ChatRoom.model";
import { User } from "../../../DAL/models/User.model";
import { Message } from "../../../DAL/models/Message.model";
import { AuthRequest } from "../../../types";

export const createChatRoomIfNotExists = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = res.locals.customer as User;
    const staff = req.user as User;

    let room = await ChatRoom.findOne({
      where: {
        customer: { id: customer.id },
        staff: { id: staff.id },
      },
    });

    if (!room) {
      room = ChatRoom.create({ customer, staff });
      await room.save();
    }

    res.locals.chatRoom = room;
    next();
  } catch (error) {
    next(error);
  }
};

export const sendSystemMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const staff = req.user as User;
    const room = res.locals.chatRoom as ChatRoom;

    const message = new Message();
    message.content = "Sifarişiniz təsdiq olundu ✅";
    message.room = room;
    message.customer = null;
    message.staff = staff;
    await message.save();

    next();
  } catch (error) {
    next(error);
  }
};

export const ChatRoomController = () => ({
  createChatRoomIfNotExists,
  sendSystemMessage,
});
