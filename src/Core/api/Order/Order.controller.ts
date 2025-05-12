import { NextFunction, Response } from "express";
import { Order } from "../../../DAL/models/Order.model";
import { OrderItem } from "../../../DAL/models/OrderItem.model";
import { MenuItem } from "../../../DAL/models/Menu.model";
import { EOrderStatusType } from "../../app/enums";
import { AuthRequest } from "../../../types";
import { CreateOrderDTO, EditOrderStatusDTO } from "./Order.dto";
import { validate } from "class-validator";
import { formatErrors } from "../../middlewares/error.middleware";
import { Location } from "../../../DAL/models/Location.model";
import { User } from "../../../DAL/models/User.model";
import { ChatRoom } from "../../../DAL/models/ChatRoom.model";
import { Message } from "../../../DAL/models/Message.model";

const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { items, location, locationId } = req.body;
    const id = Number(locationId);

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "Order must include items." });
      return;
    }

    let selectedLocation = location?.trim();

    if (!selectedLocation && locationId) {
      const savedLocation = await Location.findOne({
        where: { id, user: { id: user.id } },
        relations: ["user"],
      });

      if (!savedLocation) {
        res.status(404).json({ message: "Selected location not found." });
        return;
      }

      selectedLocation = savedLocation.address;
    }

    if (!selectedLocation) {
      res.status(400).json({ message: "Location is required." });
      return;
    }

    let totalPrice = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const menuItem = await MenuItem.findOne({
        where: { id: item.menuItemId },
      });

      if (!menuItem) {
        res
          .status(404)
          .json({ message: `MenuItem ID ${item.menuItemId} not found` });
        return;
      }

      const price = Number(menuItem.price) * item.quantity;
      totalPrice += price;

      const orderItem = OrderItem.create({
        menuItem,
        quantity: item.quantity,
        price: Number(menuItem.price),
      });

      orderItems.push(orderItem);
    }

    const dto = new CreateOrderDTO();
    dto.customer = user;
    dto.items = orderItems;
    dto.location = selectedLocation;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    const order = Order.create({
      customer: user,
      totalPrice,
      items: orderItems,
      location: selectedLocation,
    });

    await order.save();

    for (const orderItem of orderItems) {
      orderItem.order = order;
    }
    await OrderItem.save(orderItems);

    const data = await Order.findOne({
      where: { id: order.id },
      select: ["id", "totalPrice", "created_at", "status", "location"],
    });

    res.status(201).json({
      message: "Order created successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const id = Number(req.params.id);
    const { status } = req.body;

    const order = await Order.findOne({
      where: { id },
      relations: ["customer"],
      select: {
        id: true,
        totalPrice: true,
        created_at: true,
        status: true,
        location: true,
        customer: {
          id: true,
          name: true,
          surname: true,
        },
      },
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (!Object.values(EOrderStatusType).includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    if (order.status === status) {
      res.status(304).json({ message: "Heç bir dəyişiklik yoxdur" });
      return;
    }

    const dto = new EditOrderStatusDTO();
    dto.status = status;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    order.status = status;
    await order.save();

    const staff = req.user as User;
    const room = res.locals.chatRoom as ChatRoom;

    if (!room || !staff) {
      res.status(400).json({ message: "Chat otağı və ya staff tapılmadı" });
      return;
    }

    const message = Message.create({
      content: `Your order has been moved to ${status}`,
      room,
      customer: null,
      staff,
    });

    await message.save();
    res.status(200).json({
      message: "Order status updated",
      data: status,
    });
    }
    catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error: error instanceof Error ? error.message : error,
      });
    }
};

const getOrdersByUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const orders = await Order.find({
      where: { customer: { id: user.id } },
      relations: ["orderItems", "orderItems.menuItem"],
    });

    if (!orders) {
      res.status(404).json({ message: "Your order(s) not found" });
      return;
    }

    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const OrderController = () => ({
  createOrder,
  updateOrderStatus,
  getOrdersByUser,
});
