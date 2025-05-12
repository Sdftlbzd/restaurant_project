import { Column, Entity, OneToMany } from "typeorm";
import { CommonEntity } from "./Common.model";
import { ERoleType } from "../../Core/app/enums";
import { Order } from "./Order.model";
import { Reservation } from "./Reservation.model";
import { Location } from "./Location.model";
import { Message } from "./Message.model";
import { ChatRoom } from "./ChatRoom.model";
import { Payment } from "./Payment.model";
import { Rating } from "./Raiting.model";

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
    default: ERoleType.CUSTOMER,
  })
  role: ERoleType;

  @Column({ type: "varchar", length: 13, default: null, unique: true })
  phone: string;

  @Column({ type: "varchar", default: null })
  passToken: String;

  @Column({ type: "datetime", default: null })
  resetExpiredIn: Date;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @OneToMany(() => Message, (message) => message.customer)
  customerMessages: Message[];

  @OneToMany(() => Message, (message) => message.staff)
  staffMessages: Message[];

  @OneToMany(() => ChatRoom, (room) => room.customer)
  chatRoomsAsCustomer: ChatRoom[];

  @OneToMany(() => ChatRoom, (room) => room.staff)
  chatRoomsAsStaff: ChatRoom[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];
}
