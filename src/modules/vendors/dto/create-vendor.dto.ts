import { IsString, IsEnum, MinLength, MaxLength, IsUrl, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VendorType } from './vendor.dto';

export class CreateVendorDto {
  @ApiProperty({ example: 'University of Lagos' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: VendorType, example: VendorType.SCHOOL })
  @IsEnum(VendorType)
  type: VendorType;

  @ApiProperty({ example: 'NG' })
  @IsString()
  @Length(2, 2)
  country: string;

  @ApiProperty({ example: 'https://unilag.edu.ng' })
  @IsUrl()
  website: string;

  @ApiPropertyOptional({ example: 'A leading Nigerian university offering STEM programs.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
