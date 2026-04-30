import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NonceCleanupService } from './nonce-cleanup.service';
import { NonceCleanupProcessor } from './nonce-cleanup.processor';
import { SupabaseService } from '../../database/supabase.client';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'nonce-cleanup',
    }),
  ],
  providers: [NonceCleanupService, NonceCleanupProcessor, SupabaseService],
})
export class NonceCleanupModule {}
