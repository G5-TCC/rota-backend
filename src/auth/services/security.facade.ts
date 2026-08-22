import { Injectable } from '@nestjs/common';
import { RequestPasswordResetUseCase } from '../use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case';
import { SecurityService } from './security.service';
import { TwoFactorService } from './two-factor.service';

@Injectable()
export class SecurityFacade {
  constructor(
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly securityService: SecurityService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async forgotPassword(email: string) {
    await this.requestPasswordResetUseCase.execute(email);
    return { message: 'Password reset link sent to your email' };
  }

  async resetPassword(token: string, password: string) {
    await this.resetPasswordUseCase.execute(token, password);
    return { message: 'Password reset successful' };
  }

  async getSecurityStatus(userId: string) {
    const status = await this.securityService.getSecurityStatus(userId);
    return { ...status, message: 'Security status retrieved' };
  }

  async enable2fa(userId: string) {
    await this.twoFactorService.enable(userId);
    return { message: 'Two-factor authentication enabled successfully' };
  }

  async disable2fa(userId: string) {
    await this.twoFactorService.disable(userId);
    return { message: 'Two-factor authentication disabled successfully' };
  }
}
