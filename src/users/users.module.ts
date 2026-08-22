import { Module } from '@nestjs/common';
import { UserService } from './services/users.service';
import { UserRepository } from './repositories/user.repository';
import { UserMapper } from './mappers/user.mapper';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [UserService, UserRepository, UserMapper],
  exports: [UserService, UserRepository, UserMapper],
})
export class UsersModule {}
