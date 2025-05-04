import {
  Column,
  Entity,
  OneToMany,
} from "typeorm";
import { CommonEntity } from "./Common.model";
import { MenuItem } from "./Menu.model";

@Entity({ name: "categories" })
export class Category extends CommonEntity {
  @Column({ type: "varchar", length: 150, default: null })
  name: string;

  @Column({ type: "text", default: null })
  description: string;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.category)
  menuItems: MenuItem[];
}
