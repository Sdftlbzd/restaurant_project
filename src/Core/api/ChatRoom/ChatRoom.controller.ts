import { Request, Response } from "express";
import { ChatRoom } from "../../../DAL/models/ChatRoom.model";
import { AuthRequest } from "../../../types";
import { ERoleType } from "../../app/enums";
import { User } from "../../../DAL/models/User.model";
import { Message } from "../../../DAL/models/Message.model";
/**
 * Müştəri və staff arasında chat otağı mövcuddursa onu qaytarır, yoxdursa yaradır.
 */
export const createChatRoomIfNotExists = async (
  customer: User,
  staff: User
): Promise<ChatRoom> => {
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

  return room;
};

/**
 * Chat otağına sistem mesajı göndərir. Bu mesaj müştəri tərəfindən deyil, sistem və ya staff tərəfindən gəlmiş sayılır.
 */
export const sendSystemMessage = async (
  room: ChatRoom,
  content: string,
  senderStaff?: User
): Promise<Message> => {
  const message = new Message();
  message.content = content;
  message.room = room;
  message.customer = null;
  message.staff = senderStaff ?? null;

  await message.save();
  return message;
};

export const ChatRoomController = () => ({
  createChatRoomIfNotExists,
  sendSystemMessage,
});
