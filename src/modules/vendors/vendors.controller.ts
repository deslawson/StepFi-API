import { Controller, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { VendorResponseDto, VendorType } from './dto/vendor.dto';

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all vendors, optionally filtered by type' })
  @ApiQuery({ name: 'type', enum: VendorType, required: false })
  @ApiResponse({ status: 200, description: 'List of vendors', type: [VendorResponseDto] })
  async list(@Query('type') type?: VendorType): Promise<VendorResponseDto[]> {
    return this.vendorsService.getAll(type);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single vendor by id' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'Vendor', type: VendorResponseDto })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async getById(@Param('id') id: string): Promise<VendorResponseDto> {
    return this.vendorsService.getById(id);
  }
}
