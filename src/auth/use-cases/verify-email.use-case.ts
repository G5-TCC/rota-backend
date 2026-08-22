import { Injectable } from '@nestjs/common';
import { UserService } from '../../users/services/users.service';

@Injectable()
export class VerifyEmailUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(token: string) {
    return this.userService.verifyEmail(token);
  }
}
