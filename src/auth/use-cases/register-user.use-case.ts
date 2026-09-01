import { Injectable } from '@nestjs/common';
import { UserService } from '../../users/services/users.service';
import { SecurityService } from '../services/security.service';
import { RegisterDto } from '@ROTA-TCC/types';
import { Email } from '../../common/domain/value-objects/email.vo';
import { Password } from '../../common/domain/value-objects/password.vo';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly securityService: SecurityService,
  ) {}

  async execute(registrationData: RegisterDto, requestId?: string) {
    // Validação básica via VOs (já disparam exceções se inválidos)
    new Email(registrationData.email);
    const password = new Password(registrationData.password);

    // Hash da senha
    const hashedPassword = await this.securityService.hashPassword(
      password.toString(),
    );

    // Criação do usuário (o UserService emite o evento user.created)
    // Nota: Atualmente o UserService não recebe requestId, poderíamos passar se necessário.
    return this.userService.create(registrationData, hashedPassword);
  }
}
