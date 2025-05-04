import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { CommonEntity } from "./Common.model";
import { ECategoryType } from "../../Core/app/enums";
import { Review } from "./Review.model";
import { Category } from "./Category.model";

@Entity({ name: "menu" })
export class MenuItem extends CommonEntity {
  @Column({ type: "varchar", length: 150, default: null })
  name: string;

  @Column({ type: "varchar", length: 150, default: null })
  description: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column({ type: "varchar", length: 150 })
  imagePath?: string;

  @Column({ type: "boolean", default: true })
  available: boolean;

  @OneToMany(() => Review, (review) => review.menuItem)
  reviews: Review[];

  @ManyToOne(() => Category, (category) => category.menuItems)
  category: Category;
}
