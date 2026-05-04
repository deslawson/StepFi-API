import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.client';
import { VendorResponseDto, VendorType } from './dto/vendor.dto';

interface VendorRow {
  id: string;
  wallet_address: string;
  name: string;
  type: VendorType;
  verified: boolean;
  website: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
}

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getAll(type?: VendorType): Promise<VendorResponseDto[]> {
    const client = this.supabaseService.getClient();
    let query = client.from('vendors').select('*').order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(`Failed to list vendors: ${error.message}`);
      throw new Error('Failed to list vendors.');
    }

    const rows: VendorRow[] = (data ?? []) as VendorRow[];
    return rows.map((row) => this.mapToDto(row));
  }

  async getById(id: string): Promise<VendorResponseDto> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'VENDOR_NOT_FOUND',
        message: 'Vendor not found.',
      });
    }

    return this.mapToDto(data as VendorRow);
  }

  private mapToDto(data: VendorRow): VendorResponseDto {
    return {
      id: data.id,
      walletAddress: data.wallet_address,
      name: data.name,
      type: data.type,
      verified: data.verified,
      website: data.website ?? undefined,
      country: data.country ?? undefined,
      city: data.city ?? undefined,
      createdAt: data.created_at,
    };
  }
}
