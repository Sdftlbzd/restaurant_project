import { Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User.model";
import { Message } from "./Message.model";
import { CommonEntity } from "./Common.model";

@Entity({ name: "chat_rooms" })
export class ChatRoom extends CommonEntity {
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "customer_id" })
  customer: User;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "staff_id" })
  staff: User;

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
