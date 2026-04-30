import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NonceCleanupService implements OnModuleInit {
  private readonly logger = new Logger(NonceCleanupService.name);

  constructor(
    @InjectQueue('nonce-cleanup') private readonly queue: Queue,
  ) {}

  async onModuleInit() {
    await this.queue.remove('nonce-cleanup-job');
    await this.queue.add(
      'nonce-cleanup-job',
      {},
      {
        repeat: { pattern: '0 * * * *' }, // Every hour
        removeOnComplete: { count: 10 },
        removeOnFail: { count: 50 },
      },
    );
    this.logger.log('Nonce cleanup job scheduled — runs every hour');
  }
}
