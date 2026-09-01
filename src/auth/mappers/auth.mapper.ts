import { Injectable } from '@nestjs/common';
import { AuthResponse, AuthUserResponse } from '@ROTA-TCC/types';
import { AuthenticatedUser } from '@ROTA-TCC/types';
import { UserMapper } from '../../users/mappers/user.mapper';

@Injectable()
export class AuthMapper {
  constructor(private readonly userMapper: UserMapper) {}

  toAuthResponse(
    user: AuthenticatedUser,
    session: { accessToken: string },
  ): AuthResponse {
    return {
      accessToken: session.accessToken,
      user: this.userMapper.toResponse(user),
    };
  }

  toUserResponse(user: any): AuthUserResponse {
    return this.userMapper.toResponse(user);
  }
}
