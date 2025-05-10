import {
  IsDecimal,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { User } from "../../../DAL/models/User.model";
import { OrderItem } from "../../../DAL/models/OrderItem.model";
import { EOrderStatusType } from "../../app/enums";

export class CreateOrderDTO {
  @IsDefined()
  @IsString()
  @MaxLength(50)
  @MinLength(5)
  location: string;

  @IsDefined()
  customer: User;

  @IsDefined()
  items: OrderItem[];
}

export class EditOrderStatusDTO {
  @IsDefined()
  @IsEnum(EOrderStatusType)
  status: EOrderStatusType;
}
