import { IsDefined, IsEnum, IsNumber } from "class-validator";
import { EPaymentMethod } from "../../app/enums";

export class PaymentCreateDTO {
  @IsDefined()
  @IsNumber()
  id: number;

  @IsDefined()
  @IsEnum(EPaymentMethod)
  method: EPaymentMethod;
}
