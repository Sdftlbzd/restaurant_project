import { Column, Entity } from "typeorm";
import { CommonEntity } from "./Common.model";
import { ERoleType } from "../../Core/app/enums";

@Entity({ name: "users" })
export class User extends CommonEntity {
  @Column({ type: "varchar", length: 150, default:null})
  name: string;

  @Column({ type: "varchar", length: 150, default:null })
  surname: string;

  @Column({ type: "varchar", length: 150 })
  email: string;

  @Column({ type: "varchar", length: 150 })
  password: string;

  @Column({
    type: "enum",
    enum: ERoleType,
    default: ERoleType.USER,
  })
  role: ERoleType;

  @Column({ type: "varchar", length: 13, default: null, unique:true })
  phone: string;
}
