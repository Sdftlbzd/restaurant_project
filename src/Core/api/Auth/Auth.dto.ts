import {
  IsDefined,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { Location } from "../../../DAL/models/Location.model";

export class CreateUserDTO {
  @IsDefined({ message: "Name is required" })
  @IsString()
  @MaxLength(25, { message: "Name is too long" })
  @MinLength(3, { message: "En az 3 simvol olmalidir" })
  name: string;

  @IsDefined()
  @IsString()
  @MaxLength(50)
  surname: string;

  @IsOptional()
  locations: Location[];

  @IsDefined()
  @IsEmail({}, { message: "Email düzgün formatda olmalıdır." })
  email: string;

  @IsDefined()
  @IsString()
  @MinLength(8, { message: "En az 8 simvol olmalidir" })
  @MaxLength(15, { message: "Pass is too long" })
  password: string;

  @IsOptional()
  @IsPhoneNumber()
  @Matches(/^\+994\d{9}$/, {
    message: "Phone number must be in +994XXXXXXXXX format",
  })
  phone: string;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @MaxLength(25, { message: "Name is too long" })
  @MinLength(3, { message: "En az 3 simvol olmalidir" })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  surname: string;

  @IsOptional()
  locations: Location[];

  @IsOptional()
  @IsPhoneNumber()
  @Matches(/^\+994\d{9}$/, {
    message: "Phone number must be in +994XXXXXXXXX format",
  })
  phone: string;
}

export class CreatePassDTO {
  @IsDefined()
  @IsString()
  @MinLength(8, { message: "En az 8 simvol olmalidir" })
  @MaxLength(15, { message: "Pass is too long" })
  password: string;
}
