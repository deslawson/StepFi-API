import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IncomeType, ProgramType } from './learner-profile.dto';

export class LearnerResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() walletAddress: string;
  @ApiPropertyOptional() school?: string;
  @ApiPropertyOptional() program?: string;
  @ApiPropertyOptional({ enum: ProgramType }) programType?: ProgramType;
  @ApiPropertyOptional({ enum: IncomeType }) incomeType?: IncomeType;
  @ApiPropertyOptional() monthlyIncome?: number;
  @ApiPropertyOptional() country?: string;
  @ApiPropertyOptional() city?: string;
  @ApiPropertyOptional() deviceOwned?: boolean;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}
