import { Column, Entity, ManyToOne } from "typeorm";
import { CommonEntity } from "./Common.model";
import { User } from "./User.model";
import { MenuItem } from "./Menu.model";

@Entity({ name: "reviews" })
export class Review extends CommonEntity {
  @ManyToOne(() => User, (user) => user.reviews)
  user: User;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.reviews)
  menuItem: MenuItem;

  @Column("int")
  rating: number; 

  @Column({ type: "text" })
  comment: string;
}
