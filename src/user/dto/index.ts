import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Length,
  IsIn,
  IsArray,
  ArrayMaxSize,
  Matches,
} from 'class-validator';
export class CreateUserDto {
  @IsString()
  name!: string;
  @Length(11)
  @IsString()
  phone!: string;
  @MinLength(6)
  @MaxLength(12)
  @IsString()
  password!: string;
  @IsString()
  @MinLength(6)
  @MaxLength(12)
  confirmPassword!: string;
}
export class LoginByPhoneDto {
  @IsString()
  @Length(11)
  phone!: string;
  @IsString()
  password!: string;
}

export class LoginByNameDto {
  @IsString()
  name!: string;
  @IsString()
  password!: string;
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

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  introduction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  direction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  area?: string;

  @IsOptional()
  @IsIn(['男', '女'])
  gender?: '男' | '女' | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  tags?: string[];
}

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(12)
  newPassword!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(12)
  confirmPassword!: string;
}

export class ChangePhoneDto {
  @IsString()
  password!: string;

  @IsString()
  @Length(11)
  @Matches(/^1\d{10}$/)
  phone!: string;
}
