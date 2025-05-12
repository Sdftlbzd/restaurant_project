import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { CommonEntity } from "./Common.model";
import { Category } from "./Category.model";
import { Rating } from "./Raiting.model";

@Entity({ name: "menu" })
export class MenuItem extends CommonEntity {
  @Column({ type: "varchar", length: 150, default: null })
  name: string;

  @Column({ type: "varchar", length: 150, default: null })
  description: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  rating: number;

  @Column({ type: "varchar", length: 150 })
  imagePath?: string;

  @Column({ type: "boolean", default: true })
  available: boolean;

  @OneToMany(() => Rating, (rating) => rating.menuItem)
  ratings: Rating[];

  @ManyToOne(() => Category, (category) => category.menuItems)
  category: Category;
}
