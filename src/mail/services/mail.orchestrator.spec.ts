import { Test, TestingModule } from '@nestjs/testing';
import { MailOrchestrator } from './mail.orchestrator';
import { ConfigService } from '@nestjs/config';

describe('MailOrchestrator', () => {
  let orchestrator: MailOrchestrator;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    configService = {
      get: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailOrchestrator,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    orchestrator = module.get<MailOrchestrator>(MailOrchestrator);
  });

  it('should be defined', () => {
    expect(orchestrator).toBeDefined();
  });

  // Nota: MailOrchestrator usa nodemailer, testar o envio real exigiria mocks mais complexos ou ferramentas como mailtrap
});
