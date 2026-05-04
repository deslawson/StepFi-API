import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum IncomeType {
  EMPLOYED = 'employed',
  INTERN = 'intern',
  FREELANCE = 'freelance',
  STUDENT = 'student',
  UNEMPLOYED = 'unemployed',
}

export enum ProgramType {
  BOOTCAMP = 'bootcamp',
  UNIVERSITY = 'university',
  SELF_TAUGHT = 'self_taught',
  ONLINE_COURSE = 'online_course',
  APPRENTICESHIP = 'apprenticeship',
}

export class UpdateLearnerProfileDto {
  @ApiPropertyOptional({ example: 'University of Lagos' })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional({ enum: ProgramType })
  @IsOptional()
  @IsEnum(ProgramType)
  programType?: ProgramType;

  @ApiPropertyOptional({ enum: IncomeType })
  @IsOptional()
  @IsEnum(IncomeType)
  incomeType?: IncomeType;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyIncome?: number;

  @ApiPropertyOptional({ example: 'Nigeria' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  city?: string;
}
