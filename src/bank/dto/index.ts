import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';

export class createBankDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsString()
  @IsNotEmpty()
  description!: string;
  @IsArray()
  @ArrayMinSize(1)
  disciplines!: string[];
  @IsNumber()
  @IsOptional()
  categoryId?: number;
  @IsString()
  @IsOptional()
  categoryName?: string;
}
export class getBankDto {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  creator?: string;
  @IsNumber()
  @IsOptional()
  categoryId?: number;
  @IsString()
  @IsOptional()
  categoryName?: string;
}
