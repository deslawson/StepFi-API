import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.client';
import {
  CreateSponsorDto,
  SponsorDepositDto,
  SponsorResponseDto,
  SponsorStatsDto,
  SponsorType,
} from './dto/sponsor.dto';

interface SponsorPoolRow {
  id: string;
  wallet_address: string;
  org_name: string;
  sponsor_type: SponsorType;
  website: string | null;
  description: string | null;
  total_deposited: string | number;
  available: string | number;
  locked: string | number;
  created_at: string;
}

interface SponsorAggregateRow {
  total_deposited: string | number | null;
  available: string | number | null;
  locked: string | number | null;
}

const toNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  return typeof value === 'number' ? value : Number(value);
};

@Injectable()
export class SponsorsService {
  private readonly logger = new Logger(SponsorsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async register(
    wallet: string,
    dto: CreateSponsorDto,
  ): Promise<SponsorResponseDto> {
    const client = this.supabaseService.getServiceRoleClient();

    const { data: existing, error: existingError } = await client
      .from('sponsor_pools')
      .select('id')
      .eq('wallet_address', wallet)
      .maybeSingle();

    if (existingError) {
      this.logger.error(`Failed to check existing sponsor: ${existingError.message}`);
      throw new Error('Failed to check existing sponsor.');
    }

    if (existing) {
      throw new ConflictException({
        code: 'SPONSOR_ALREADY_REGISTERED',
        message: 'This wallet is already registered as a sponsor.',
      });
    }

    const { data, error } = await client
      .from('sponsor_pools')
      .insert({
        wallet_address: wallet,
        org_name: dto.orgName,
        sponsor_type: dto.sponsorType,
        website: dto.website ?? null,
        description: dto.description ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      this.logger.error(`Failed to register sponsor ${wallet}: ${error?.message}`);
      throw new Error('Failed to register sponsor.');
    }

    this.logger.log(`Sponsor registered: ${wallet} (${dto.orgName})`);
    return this.mapToDto(data as SponsorPoolRow);
  }

  async deposit(
    wallet: string,
    dto: SponsorDepositDto,
  ): Promise<{ unsignedXdr: string }> {
    // TODO: wire to LiquidityContractClient when contracts are deployed.
    this.logger.log(
      `Sponsor deposit requested: wallet=${wallet} amount=${dto.amount} (placeholder XDR)`,
    );
    return { unsignedXdr: 'PENDING_CONTRACT_INTEGRATION' };
  }

  async getMyPool(wallet: string): Promise<SponsorResponseDto> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('sponsor_pools')
      .select('*')
      .eq('wallet_address', wallet)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'SPONSOR_NOT_FOUND',
        message: 'Sponsor pool not found for this wallet.',
      });
    }

    return this.mapToDto(data as SponsorPoolRow);
  }

  async getStats(): Promise<SponsorStatsDto> {
    const client = this.supabaseService.getServiceRoleClient();

    const { data, error, count } = await client
      .from('sponsor_pools')
      .select('total_deposited, available, locked', { count: 'exact' });

    if (error) {
      this.logger.error(`Failed to aggregate sponsor stats: ${error.message}`);
      throw new Error('Failed to aggregate sponsor stats.');
    }

    const rows = (data ?? []) as SponsorAggregateRow[];
    const totals = rows.reduce(
      (acc, row) => {
        acc.totalDeposited += toNumber(row.total_deposited);
        acc.totalAvailable += toNumber(row.available);
        acc.totalLocked += toNumber(row.locked);
        return acc;
      },
      { totalDeposited: 0, totalAvailable: 0, totalLocked: 0 },
    );

    return {
      totalSponsors: count ?? rows.length,
      totalDeposited: totals.totalDeposited,
      totalAvailable: totals.totalAvailable,
      totalLocked: totals.totalLocked,
    };
  }

  private mapToDto(data: SponsorPoolRow): SponsorResponseDto {
    return {
      id: data.id,
      walletAddress: data.wallet_address,
      orgName: data.org_name,
      sponsorType: data.sponsor_type,
      website: data.website ?? undefined,
      description: data.description ?? undefined,
      totalDeposited: toNumber(data.total_deposited),
      available: toNumber(data.available),
      locked: toNumber(data.locked),
      createdAt: data.created_at,
    };
  }
}
