import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.wallet) {
      throw new ForbiddenException({
        code: 'ADMIN_ACCESS_DENIED',
        message: 'Admin access required.',
      });
    }

    const adminWalletsConfig = this.configService.get<string>('ADMIN_WALLETS', '');
    const adminWallets = adminWalletsConfig
      .split(',')
      .map((w: string) => w.trim())
      .filter(Boolean);

    if (adminWallets.length === 0 || !adminWallets.includes(user.wallet)) {
      throw new ForbiddenException({
        code: 'ADMIN_ACCESS_DENIED',
        message: 'Admin access required.',
      });
    }

    return true;
  }
}
