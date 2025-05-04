import {
  IsDecimal,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ECategoryType } from "../../app/enums";
import { Category } from "../../../DAL/models/Category.model";

export class CreateMenuItemDTO {
  @IsDefined()
  @IsString()
  @MaxLength(20)
  @MinLength(2)
  name: string;

  @IsDefined()
  @IsString()
  @MaxLength(100)
  @MinLength(10)
  description: string;

  @IsDefined()
  @IsDecimal()
  price: number;

  @IsDefined()
  category: Category;

  @IsOptional()
  @IsString()
  imagePath: string;

  @IsOptional()
  available: boolean;
}

export class EditMenuItemDTO {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsDecimal()
  @MaxLength(100)
  @MinLength(1)
  price: number;

  @IsOptional()
  category: Category;

  @IsOptional()
  @IsString()
  imagePath: string;

  @IsOptional()
  available: boolean;
}
