import { Column, Entity, ManyToOne } from "typeorm";
import { CommonEntity } from "./Common.model";
import { Order } from "./Order.model";
import { MenuItem } from "./Menu.model";

@Entity({ name: "orderitems" })
export class OrderItem extends CommonEntity {
  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ManyToOne(() => MenuItem)
  menuItem: MenuItem;

  @Column("int")
  quantity: number;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;
}
