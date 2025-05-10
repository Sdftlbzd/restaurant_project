import { Request, Response } from "express";
import { AuthRequest } from "../../../types";
import { Order } from "../../../DAL/models/Order.model";
import { EOrderStatusType, EPaymentMethod } from "../../../Core/app/enums";
import { Payment } from "../../../DAL/models/Payment.model";

export const payForOrder = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const id = Number(req.params.id);

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const order = await Order.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!order || order.customer.id !== user.id) {
      res.status(404).json({ message: "Order not found or access denied" });
      return;
    }

    if (order.status !== EOrderStatusType.ACCEPTED) {
      res.status(400).json({ message: "Order is not ready for payment" });
      return;
    }

    order.status = EOrderStatusType.PAID;
    await order.save();
    const method = req.body;
    if (!Object.values(EPaymentMethod).includes(method)) {
      res.status(400).json({ message: "Invalid payment method" });
      return;
    }

    if (order.status === EOrderStatusType.PAID) {
      const payment = new Payment();
      payment.user = user;
      payment.order = order;
      payment.amount = order.totalPrice;
      payment.method = method;
      payment.isSuccessful = true;
      await payment.save();
    }
    res.json({
      message: "Ödəniş uğurla tamamlandı ✅",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Xəta baş verdi",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const PaymentController = () => ({
  payForOrder,
});
