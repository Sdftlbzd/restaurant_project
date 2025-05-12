import { Entity, Column, ManyToOne } from "typeorm";
import { CommonEntity } from "./Common.model";
import { User } from "./User.model";
import { Order } from "./Order.model";
import { EPaymentMethod } from "../../Core/app/enums";

@Entity({ name: "payments" })
export class Payment extends CommonEntity {
  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: EPaymentMethod,
  })
  method: EPaymentMethod;

  @Column({ type: "boolean", default: false })
  isSuccessful: boolean;
}
