import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { SupabaseService } from '../../database/supabase.client';

@Module({
  providers: [VendorsService, SupabaseService],
  controllers: [VendorsController],
  exports: [VendorsService],
})
export class VendorsModule {}
