import { IsString, MaxLength } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  @MaxLength(400)
  content!: string;
}
