import { Entity, Column, ManyToOne } from "typeorm";
import { CommonEntity } from "./Common.model";
import { User } from "./User.model";
import { Order } from "./Order.model";

@Entity({ name: "payments" })
export class Payment extends CommonEntity {
  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "varchar", length: 50 })
  method: string; // məsələn: 'card', 'cash', 'online'

  @Column({ type: "boolean", default: false })
  isSuccessful: boolean;
}