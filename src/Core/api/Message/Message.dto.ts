import {
  IsDefined,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class MessageCreateDtO {
  @IsDefined()
  @IsNumber()
  roomId: number;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  content: string;
}
