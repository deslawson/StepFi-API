import { ApiProperty } from '@nestjs/swagger';
import { VendorResponseDto } from './vendor.dto';

export class VendorPaginatedResponseDto {
  @ApiProperty({ type: [VendorResponseDto] })
  data: VendorResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;
}
