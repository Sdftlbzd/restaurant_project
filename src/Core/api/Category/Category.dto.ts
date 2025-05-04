import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CategoryCreateDto {
  @IsDefined()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(150)
  description: string;
}

export class CategoryUpdateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  description: string;
}
