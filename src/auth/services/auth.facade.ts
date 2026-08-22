import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserUseCase } from '../use-cases/login-user.use-case';
import { VerifyTwoFactorUseCase } from '../use-cases/verify-2fa.use-case';
import { SessionService } from './session.service';
import { LoginDto } from '../dtos/auth.dto';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { AuthMapper } from '../mappers/auth.mapper';

@Injectable()
export class AuthFacade {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly verifyTwoFactorUseCase: VerifyTwoFactorUseCase,
    private readonly sessionService: SessionService,
    private readonly authMapper: AuthMapper,
  ) {}

  async login(credentials: LoginDto, ipAddress: string, userAgent: string): Promise<any> {
    const authResult = await this.loginUserUseCase.execute(credentials, ipAddress, userAgent);

    if (authResult.requires2fa) {
      return { 
        requires2fa: true, 
        partialToken: authResult.partialToken!,
        message: 'Two-factor authentication required'
      };
    }

    const user = authResult.user!;
    const session = await this.sessionService.create(
      user.id,
      ipAddress,
      userAgent,
      !!credentials.rememberMe,
      user.role,
      user.isVerified
    );

    const response = this.authMapper.toAuthResponse(user as AuthenticatedUser, session);
    return { ...response, message: 'Login successful' };
  }

  async refresh(token: string, userAgent: string) {
    if (!token) {
      throw new UnauthorizedException('Token ausente');
    }
    const response = await this.sessionService.refresh(token, userAgent);
    return { ...response, message: 'Token refreshed successfully' };
  }

  async logout(token: string) {
    if (token) {
      await this.sessionService.revokeSession(token, '');
    }
    return { 
      clearCookie: true, 
      message: 'Logged out successfully' 
    };
  }

  async verify2fa(partialToken: string, code: string, ipAddress: string, userAgent: string): Promise<any> {
    const user = (await this.verifyTwoFactorUseCase.execute(partialToken, code)) as AuthenticatedUser;
    const session = await this.sessionService.create(user.id, ipAddress, userAgent, false, user.role, user.isVerified);
    
    const response = this.authMapper.toAuthResponse(user, session);
    return { ...response, message: '2FA verification successful' };
  }
}
