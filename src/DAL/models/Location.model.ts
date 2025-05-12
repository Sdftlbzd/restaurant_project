import { Entity, Column, ManyToOne } from "typeorm";
import { CommonEntity } from "./Common.model";
import { User } from "./User.model";

@Entity({ name: "locations" })
export class Location extends CommonEntity {
  @Column({ type: "varchar", length: 150 })
  title: string;

  @Column({ type: "varchar", length: 150 })
  address: string;

  @ManyToOne(() => User, (user) => user.locations)
  user: User;
}
