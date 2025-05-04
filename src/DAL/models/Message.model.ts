import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User.model";
import { ChatRoom } from "./ChatRoom.model";
import { CommonEntity } from "./Common.model";

@Entity({ name: "messages" })
export class Message extends CommonEntity {
  @Column({ type: "varchar", length: 150 })
  content: string;

  @Column({ type: "boolean", default: false })
  read: boolean;

  @ManyToOne(() => ChatRoom, (room) => room.messages, { onDelete: "CASCADE" })
  @JoinColumn({ name: "room_id" })
  room: ChatRoom;

  @ManyToOne(() => User, (user) => user.customerMessages, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "customer_id" })
  customer: User | null;

  @ManyToOne(() => User, (user) => user.staffMessages, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "staff_id" })
  staff: User | null;
}
