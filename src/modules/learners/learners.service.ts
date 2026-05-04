import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.client';
import { UpdateLearnerProfileDto } from './dto/learner-profile.dto';
import { LearnerResponseDto } from './dto/learner-response.dto';

@Injectable()
export class LearnersService {
  private readonly logger = new Logger(LearnersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfile(wallet: string): Promise<LearnerResponseDto> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('learner_profiles')
      .select('*')
      .eq('wallet_address', wallet)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'LEARNER_PROFILE_NOT_FOUND',
        message: 'Learner profile not found.',
      });
    }

    return this.mapToDto(data);
  }

  async upsertProfile(
    wallet: string,
    dto: UpdateLearnerProfileDto,
  ): Promise<LearnerResponseDto> {
    const client = this.supabaseService.getServiceRoleClient();

    const { data, error } = await client
      .from('learner_profiles')
      .upsert(
        {
          wallet_address: wallet,
          school: dto.school,
          program: dto.program,
          program_type: dto.programType,
          income_type: dto.incomeType,
          monthly_income: dto.monthlyIncome,
          country: dto.country,
          city: dto.city,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'wallet_address' },
      )
      .select()
      .single();

    if (error || !data) {
      this.logger.error(`Failed to upsert learner profile for ${wallet}: ${error?.message}`);
      throw new Error('Failed to update learner profile.');
    }

    this.logger.log(`Learner profile updated for ${wallet}`);
    return this.mapToDto(data);
  }

  private mapToDto(data: any): LearnerResponseDto {
    return {
      id: data.id,
      walletAddress: data.wallet_address,
      school: data.school,
      program: data.program,
      programType: data.program_type,
      incomeType: data.income_type,
      monthlyIncome: data.monthly_income,
      country: data.country,
      city: data.city,
      deviceOwned: data.device_owned,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
