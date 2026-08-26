import { Injectable } from '@nestjs/common';
import { AuthUserResponse } from '../../auth/dtos/auth-response.dto';

@Injectable()
export class UserMapper {
  toResponse(user: {
    id: string;
    email: string;
    alias: string;
  }): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      alias: user.alias,
    };
  }
}
