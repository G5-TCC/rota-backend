import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from './register-user.use-case';
import { UserService } from '../../users/services/users.service';
import { SecurityService } from '../services/security.service';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userService: UserService;
  let securityService: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: UserService,
          useValue: { create: jest.fn() },
        },
        {
          provide: SecurityService,
          useValue: { hashPassword: jest.fn().mockResolvedValue('hashed_password') },
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    userService = module.get<UserService>(UserService);
    securityService = module.get<SecurityService>(SecurityService);
  });

  it('should successfully register a user', async () => {
    const dto = { email: 'test@example.com', password: 'password123', alias: 'tester' };
    (userService.create as jest.Mock).mockResolvedValue({ id: '1', ...dto });

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(securityService.hashPassword).toHaveBeenCalledWith('password123');
    expect(userService.create).toHaveBeenCalled();
  });
});
