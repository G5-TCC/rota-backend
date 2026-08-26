import { Injectable } from '@nestjs/common';
import { AuthResponse } from '../dtos/auth-response.dto';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
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
}
