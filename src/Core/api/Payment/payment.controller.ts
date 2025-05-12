import { Request, Response } from "express";
import { AuthRequest } from "../../../types";
import { Order } from "../../../DAL/models/Order.model";
import { EOrderStatusType, EPaymentMethod } from "../../../Core/app/enums";
import { Payment } from "../../../DAL/models/Payment.model";
import { PaymentCreateDTO } from "./payment.dto";
import { validate } from "class-validator";
import { formatErrors } from "../../middlewares/error.middleware";

const payForOrder = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const id = Number(req.body.id);
    const method = req.body.method;

    const dto = new PaymentCreateDTO();
    dto.id = id;
    dto.method = method;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!id) {
      res.status(400).json("Id is required");
      return;
    }

    const order = await Order.findOne({
      where: { id, customer: { id: user.id } },
      relations: ["customer"],
      select: {
        id: true,
        totalPrice: true,
        updated_at: true,
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
      res.status(404).json({ message: "Order not found or access denied" });
      return;
    }

    // ⏱️ 5 dəqiqə vaxt limiti yoxlaması
    const now = new Date();
    const lastUpdated = new Date(order.updated_at);
    const fiveMinutesInMs = 5 * 60 * 1000;

    if (now.getTime() - lastUpdated.getTime() > fiveMinutesInMs) {
      res.status(400).json({ message: "Ödəniş üçün zaman limiti keçib ⏱️" });
      return;
    }

    if (order.status === EOrderStatusType.PAID) {
      res.status(400).json({ message: "Order is already paid" });
      return;
    }

    if (order.status !== EOrderStatusType.ACCEPTED) {
      res.status(400).json({ message: "Order is not ready for payment" });
      return;
    }

    if (!Object.values(EPaymentMethod).includes(method)) {
      res.status(400).json({ message: "Invalid payment method" });
      return;
    }

    order.status = EOrderStatusType.PAID;
    await order.save();

    const payment = new Payment();
    payment.user = user;
    payment.order = order;
    payment.amount = order.totalPrice;
    payment.method = method;
    payment.isSuccessful = true;
    await payment.save();

    res.json({
      message: "Ödəniş uğurla tamamlandı ✅",
      data: order,
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
