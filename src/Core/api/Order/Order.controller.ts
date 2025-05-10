import { NextFunction, Response } from "express";
import { Order } from "../../../DAL/models/Order.model";
import { OrderItem } from "../../../DAL/models/OrderItem.model";
import { MenuItem } from "../../../DAL/models/Menu.model";
import { EOrderStatusType } from "../../app/enums";
import { AuthRequest } from "../../../types";
import { CreateOrderDTO, EditOrderStatusDTO } from "./Order.dto";
import { validate } from "class-validator";
import { formatErrors } from "../../middlewares/error.middleware";
import { ChatRoom } from "../../../DAL/models/ChatRoom.model";
import { User } from "../../../DAL/models/User.model";
import { Message } from "../../../DAL/models/Message.model";

const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { items, location } = req.body; // items: [{ menuItemId, quantity }]

    // {
    //     "items": [
    //       { "menuItemId": 1, "quantity": 2 },
    //       { "menuItemId": 3, "quantity": 1 }
    //     ]
    //   }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "Order must include items." });
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
    dto.location = location;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    const order = Order.create({
      customer: user,
      totalPrice,
      items: orderItems,
      location,
    });

    await order.save();
    await OrderItem.save(items.map((item) => ({ ...item, order })));

    res.status(201).json({
      message: "Order created successfully",
      data: order,
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
      relations: ["orderItems", "customer"],
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

    // müştərini saxla ki, növbəti middleware-lər istifadə etsin
    res.locals.customer = order.customer;

    // status COMPLETED-dirsə növbəti middleware-lərə keç
    if (status === EOrderStatusType.COMPLETED) {
      next(); // davam et (chatRoom və systemMessage middleware-lərinə)
    } else {
      res.json({
        message: `Sifariş statusu yeniləndi: ${status}`,
        data: order,
      });
    }
  } catch (error) {
    next(error);
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
