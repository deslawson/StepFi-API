import { Module } from '@nestjs/common';
import { VouchingService } from './vouching.service';
import { VouchingController } from './vouching.controller';
import { SupabaseService } from '../../database/supabase.client';

@Module({
  providers: [VouchingService, SupabaseService],
  controllers: [VouchingController],
  exports: [VouchingService],
})
export class VouchingModule {}
