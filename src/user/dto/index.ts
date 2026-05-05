import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Length,
} from 'class-validator';
export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  @Length(11)
  phone: string;

  @IsString()
  @MinLength(6)
  @MaxLength(12)
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Length(11)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(12)
  password?: string;
}
