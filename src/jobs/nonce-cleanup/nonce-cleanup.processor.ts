import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SupabaseService } from '../../database/supabase.client';

@Processor('nonce-cleanup')
export class NonceCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(NonceCleanupProcessor.name);

  constructor(private readonly supabaseService: SupabaseService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`[NonceCleanup] Running job ${job.id}`);

    const client = this.supabaseService.getServiceRoleClient();

    // Delete expired nonces older than 1 hour
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { error, count } = await client
      .from('nonces')
      .delete({ count: 'exact' })
      .lt('expires_at', cutoff);

    if (error) {
      this.logger.error(`[NonceCleanup] Failed to delete expired nonces: ${error.message}`);
      throw error;
    }

    this.logger.log(`[NonceCleanup] Deleted ${count ?? 0} expired nonces`);
  }
}
