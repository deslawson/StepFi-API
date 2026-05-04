import { Module } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { SponsorsController } from './sponsors.controller';
import { SupabaseService } from '../../database/supabase.client';

@Module({
  providers: [SponsorsService, SupabaseService],
  controllers: [SponsorsController],
  exports: [SponsorsService],
})
export class SponsorsModule {}
