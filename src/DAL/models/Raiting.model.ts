import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { User } from "./User.model";
import { MenuItem } from "./Menu.model";
import { CommonEntity } from "./Common.model";

@Entity({ name: "ratings" })
export class Rating extends CommonEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.ratings)
  user: User;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.ratings)
  menuItem: MenuItem;

  @Column("decimal", { precision: 5, scale: 2 })
  rating: number;
}
