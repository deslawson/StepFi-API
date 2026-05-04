import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsPositive,
  Min,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SponsorType {
  COMPANY = 'company',
  INDIVIDUAL = 'individual',
  DAO = 'dao',
}

export class CreateSponsorDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  orgName: string;

  @ApiProperty({ enum: SponsorType })
  @IsEnum(SponsorType)
  sponsorType: SponsorType;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'Funding the next generation of African developers.' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class SponsorDepositDto {
  @ApiProperty({ example: 1000, minimum: 1 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;
}

export class SponsorResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() walletAddress: string;
  @ApiProperty() orgName: string;
  @ApiProperty({ enum: SponsorType }) sponsorType: SponsorType;
  @ApiPropertyOptional() website?: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty() totalDeposited: number;
  @ApiProperty() available: number;
  @ApiProperty() locked: number;
  @ApiProperty() createdAt: string;
}

export class SponsorStatsDto {
  @ApiProperty() totalSponsors: number;
  @ApiProperty() totalDeposited: number;
  @ApiProperty() totalLocked: number;
  @ApiProperty() totalAvailable: number;
}
