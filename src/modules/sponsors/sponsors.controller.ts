import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { SponsorsService } from './sponsors.service';
import {
  CreateSponsorDto,
  SponsorDepositDto,
  SponsorResponseDto,
  SponsorStatsDto,
} from './dto/sponsor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class SponsorDepositResponseDto {
  @ApiProperty({ example: 'PENDING_CONTRACT_INTEGRATION' })
  unsignedXdr: string;
}

@ApiTags('sponsors')
@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register the current wallet as a sponsor' })
  @ApiResponse({ status: 201, description: 'Sponsor registered', type: SponsorResponseDto })
  @ApiResponse({ status: 409, description: 'Sponsor already registered' })
  async register(
    @CurrentUser() user: { wallet: string },
    @Body() dto: CreateSponsorDto,
  ): Promise<SponsorResponseDto> {
    return this.sponsorsService.register(user.wallet, dto);
  }

  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate a sponsor deposit; returns unsigned XDR' })
  @ApiResponse({ status: 200, description: 'Unsigned XDR for the deposit transaction', type: SponsorDepositResponseDto })
  async deposit(
    @CurrentUser() user: { wallet: string },
    @Body() dto: SponsorDepositDto,
  ): Promise<SponsorDepositResponseDto> {
    return this.sponsorsService.deposit(user.wallet, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the current sponsor's pool stats" })
  @ApiResponse({ status: 200, description: 'Sponsor pool stats', type: SponsorResponseDto })
  @ApiResponse({ status: 404, description: 'Sponsor not registered' })
  async getMe(
    @CurrentUser() user: { wallet: string },
  ): Promise<SponsorResponseDto> {
    return this.sponsorsService.getMyPool(user.wallet);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get global sponsor pool aggregate stats' })
  @ApiResponse({ status: 200, description: 'Aggregate sponsor stats', type: SponsorStatsDto })
  async getStats(): Promise<SponsorStatsDto> {
    return this.sponsorsService.getStats();
  }
}
