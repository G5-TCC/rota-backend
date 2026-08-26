import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  alias: string;
}

export class AuthResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: AuthUserResponse })
  user: AuthUserResponse;
}

export interface AuthLoginResponse extends AuthResponse {
  message: string;
}

export interface AuthRefreshResponse extends AuthResponse {
  message: string;
}

export interface AuthVerify2faResponse extends AuthResponse {
  message: string;
}

export class TwoFactorRequiredResponse {
  @ApiProperty({ example: true })
  requires2fa: true;

  @ApiProperty()
  partialToken: string;
}

export class SecurityStatusResponse {
  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  is2faEnabled: boolean;

  @ApiProperty()
  plan: string;
}
