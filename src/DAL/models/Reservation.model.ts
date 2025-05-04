import { Column, Entity, ManyToOne } from "typeorm";
import { CommonEntity } from "./Common.model";
import { User } from "./User.model";
import { EReservationStatus } from "../../Core/app/enums";

@Entity({ name: "reservations" })
export class Reservation extends CommonEntity {
  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @Column({ type: "datetime"})
  date: Date;

  @Column({ type: "datetime"})
  startTime: Date;

  @Column({ type: "datetime"})
  endTime: Date;

  @Column("int")
  guests: number;

  @Column({
    type: "enum",
    enum: EReservationStatus,
    default: EReservationStatus.PENDING
  })
  status: EReservationStatus
}
