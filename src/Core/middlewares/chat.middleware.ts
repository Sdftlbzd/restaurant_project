import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { User } from "../../DAL/models/User.model";
import { ChatRoom } from "../../DAL/models/ChatRoom.model";
import { Message } from "../../DAL/models/Message.model";
import { Order } from "../../DAL/models/Order.model";
import { Reservation } from "../../DAL/models/Reservation.model";

export const setReservationCustomer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const reservation_id = Number(req.params.id)
  if (!reservation_id) {
    res.status(400).json("Id is required");
    return;
  }

  const reservation = await Reservation.findOne({
    where: { id:reservation_id },
    relations: ["user"],
  });

  if (!reservation) {
    res.status(404).json({ message: "Rezervasiya tapılmadı" });
    return;
  }

  res.locals.customer = reservation.user;
  res.locals.reservation = reservation; 
  next();
};

export const createChatRoomIfNotExists = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = res.locals.customer as User;
    const staff = req.user as User;

    if (!customer || !staff) {
      res.status(400).json({ message: "Customer və ya staff tapılmadı" });
      return;
    }

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

    if (!room || !staff) {
      res.status(400).json({ message: "Chat otağı və ya staff tapılmadı" });
      return;
    }

    const message = Message.create({
      content: "İstəyiniz qəbul olundu ✅",
      room,
      customer: null,
      staff,
    });

    await message.save();
    next();
  } catch (error) {
    next(error);
  }
};

export const setOrderCustomer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const order_id = Number(req.params.id);
  if (!order_id) {
    res.status(400).json("Id is required");
    return;
  }

  const order = await Order.findOne({
    where: { id: order_id },
    relations: ["customer"],
  });

  if (!order) {
    res.status(404).json({ message: "Sifariş tapılmadı" });
    return;
  }

  res.locals.customer = order.customer;
  res.locals.order = order;
  next();
};


