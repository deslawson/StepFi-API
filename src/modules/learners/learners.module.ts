import { Module } from '@nestjs/common';
import { LearnersService } from './learners.service';
import { LearnersController } from './learners.controller';
import { SupabaseService } from '../../database/supabase.client';

@Module({
  providers: [LearnersService, SupabaseService],
  controllers: [LearnersController],
  exports: [LearnersService],
})
export class LearnersModule {}
