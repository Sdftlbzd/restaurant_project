import { IsDefined, IsString, MaxLength, MinLength } from "class-validator";

export class LocationCreateDto {
  @IsDefined()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  title: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  address: string;
}
