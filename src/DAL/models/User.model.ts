import { Column, Entity, OneToMany } from "typeorm";
import { CommonEntity } from "./Common.model";
import { ERoleType } from "../../Core/app/enums";
import { Order } from "./Order.model";
import { Reservation } from "./Reservation.model";
import { Review } from "./Review.model";
import { Location } from "./Location.model";
import { Message } from "./Message.model";
import { ChatRoom } from "./ChatRoom.model";

@Entity({ name: "users" })
export class User extends CommonEntity {
  @Column({ type: "varchar", length: 150, default: null })
  name: string;

  @Column({ type: "varchar", length: 150, default: null })
  surname: string;

  @Column({ type: "varchar", length: 150, unique: true })
  email: string;

  @Column({ type: "varchar", length: 150 })
  password: string;

  @OneToMany(() => Location, (location) => location.user)
  locations: Location[];

  @Column({
    type: "enum",
    enum: ERoleType,
    default: ERoleType.COSTUMER,
  })
  role: ERoleType;

  @Column({ type: "varchar", length: 13, default: null, unique: true })
  phone: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Message, (message) => message.customer)
  customerMessages: Message[];

  @OneToMany(() => Message, (message) => message.staff)
  staffMessages: Message[];

  @OneToMany(() => ChatRoom, (room) => room.customer)
  chatRoomsAsCustomer: ChatRoom[];

  @OneToMany(() => ChatRoom, (room) => room.staff)
  chatRoomsAsStaff: ChatRoom[];
}
