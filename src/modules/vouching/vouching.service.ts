import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.client';
import {
  ApproveVouchDto,
  RequestVouchDto,
  VouchResponseDto,
  VouchStatus,
} from './dto/vouch.dto';

interface VouchRow {
  id: string;
  mentor_wallet: string;
  learner_wallet: string;
  message: string | null;
  status: VouchStatus;
  created_at: string;
  expires_at: string;
}

const VOUCH_TTL_DAYS = 90;
const ACTIVE_STATUSES: VouchStatus[] = [VouchStatus.PENDING, VouchStatus.APPROVED];

@Injectable()
export class VouchingService {
  private readonly logger = new Logger(VouchingService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async requestVouch(
    learnerWallet: string,
    dto: RequestVouchDto,
  ): Promise<VouchResponseDto> {
    const client = this.supabaseService.getServiceRoleClient();

    const { data: existing, error: existingError } = await client
      .from('vouches')
      .select('id, status')
      .eq('mentor_wallet', dto.mentorWallet)
      .eq('learner_wallet', learnerWallet)
      .in('status', ACTIVE_STATUSES);

    if (existingError) {
      this.logger.error(`Failed to check existing vouches: ${existingError.message}`);
      throw new Error('Failed to check existing vouches.');
    }

    if (existing && existing.length > 0) {
      throw new ConflictException({
        code: 'VOUCH_ALREADY_EXISTS',
        message: 'An active vouch already exists between this mentor and learner.',
      });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + VOUCH_TTL_DAYS * 24 * 60 * 60 * 1000);

    const { data, error } = await client
      .from('vouches')
      .insert({
        mentor_wallet: dto.mentorWallet,
        learner_wallet: learnerWallet,
        message: dto.message ?? null,
        status: VouchStatus.PENDING,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      this.logger.error(`Failed to insert vouch request: ${error?.message}`);
      throw new Error('Failed to create vouch request.');
    }

    this.logger.log(
      `Vouch requested: learner=${learnerWallet} mentor=${dto.mentorWallet}`,
    );
    return this.mapToDto(data as VouchRow);
  }

  async approveVouch(
    mentorWallet: string,
    dto: ApproveVouchDto,
  ): Promise<VouchResponseDto> {
    const client = this.supabaseService.getServiceRoleClient();

    const { data: pending, error: findError } = await client
      .from('vouches')
      .select('*')
      .eq('mentor_wallet', mentorWallet)
      .eq('learner_wallet', dto.learnerWallet)
      .eq('status', VouchStatus.PENDING)
      .maybeSingle();

    if (findError) {
      this.logger.error(`Failed to find pending vouch: ${findError.message}`);
      throw new Error('Failed to find pending vouch.');
    }

    if (!pending) {
      throw new NotFoundException({
        code: 'VOUCH_NOT_FOUND',
        message: 'No pending vouch request found for this learner.',
      });
    }

    const pendingRow = pending as VouchRow;

    const { data, error } = await client
      .from('vouches')
      .update({
        status: VouchStatus.APPROVED,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pendingRow.id)
      .select()
      .single();

    if (error || !data) {
      this.logger.error(`Failed to approve vouch ${pendingRow.id}: ${error?.message}`);
      throw new Error('Failed to approve vouch.');
    }

    this.logger.log(
      `Vouch approved: id=${pendingRow.id} mentor=${mentorWallet} learner=${dto.learnerWallet}`,
    );
    return this.mapToDto(data as VouchRow);
  }

  async getMyVouches(wallet: string): Promise<VouchResponseDto[]> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('vouches')
      .select('*')
      .eq('learner_wallet', wallet)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`Failed to list learner vouches for ${wallet}: ${error.message}`);
      throw new Error('Failed to list vouches.');
    }

    const rows = (data ?? []) as VouchRow[];
    return rows.map((row) => this.mapToDto(row));
  }

  async getMentorVouches(wallet: string): Promise<VouchResponseDto[]> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('vouches')
      .select('*')
      .eq('mentor_wallet', wallet)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`Failed to list mentor vouches for ${wallet}: ${error.message}`);
      throw new Error('Failed to list vouches.');
    }

    const rows = (data ?? []) as VouchRow[];
    return rows.map((row) => this.mapToDto(row));
  }

  private mapToDto(data: VouchRow): VouchResponseDto {
    return {
      id: data.id,
      mentorWallet: data.mentor_wallet,
      learnerWallet: data.learner_wallet,
      message: data.message ?? undefined,
      status: data.status,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
    };
  }
}
