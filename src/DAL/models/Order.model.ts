import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { CommonEntity } from "./Common.model";
import { User } from "./User.model";
import { OrderItem } from "./OrderItem.model";
import { EOrderStatusType } from "../../Core/app/enums";
import { Payment } from "./Payment.model";

@Entity({ name: "orders" })
export class Order extends CommonEntity {
  @ManyToOne(() => User, (user) => user.orders)
  customer: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];

  @Column("decimal", { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: "varchar", length: 150 })
  location: string;

  @Column({
    type: "enum",
    enum: EOrderStatusType,
    default: EOrderStatusType.PENDING,
  })
  status: EOrderStatusType;

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}
