import {
  IsDate,
  IsDefined,
  IsEnum,
  IsNumber,
  MaxLength,
  MinLength,
} from "class-validator";
import { User } from "../../../DAL/models/User.model";
import { EReservationStatus } from "../../app/enums";

export class CreateReservationDTO {
  @IsDefined()
  user: User;

  @IsDefined()
  @IsDate()
  startTime: Date;

  @IsDefined()
  @IsDate()
  endTime: Date;

  @IsDefined()
  @IsNumber()
  guests: number;
}

export class EditReservationStatusDTO {
  @IsDefined()
  @IsEnum(EReservationStatus)
  status: EReservationStatus;
}
