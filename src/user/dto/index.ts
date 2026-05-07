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
  @Length(11)
  @IsString()
  phone: string;
  @MinLength(6)
  @MaxLength(12)
  @IsString()
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
