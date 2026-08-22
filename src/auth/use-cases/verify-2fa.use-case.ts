import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TwoFactorService } from '../services/two-factor.service';

@Injectable()
export class VerifyTwoFactorUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async execute(partialToken: string, code: string) {
    try {
      const payload = this.jwtService.verify(partialToken);
      const user = await this.twoFactorService.findUser(payload.sub);

      if (!user || !(await this.twoFactorService.verifyCode(user, code))) {
        throw new UnauthorizedException('Invalid or expired 2FA code');
      }

      await this.twoFactorService.clear2faCode(user.id);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired 2FA token');
    }
  }
}
