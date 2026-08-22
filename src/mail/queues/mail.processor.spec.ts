import { Test, TestingModule } from '@nestjs/testing';
import { MailProcessor } from './mail.processor';
import { MailOrchestrator } from '../services/mail.orchestrator';
import { TemplateService } from '../services/template.service';

describe('MailProcessor', () => {
  let processor: MailProcessor;
  let orchestrator: jest.Mocked<MailOrchestrator>;
  let templateService: jest.Mocked<TemplateService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailProcessor,
        {
          provide: MailOrchestrator,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: TemplateService,
          useValue: {
            render: jest.fn().mockResolvedValue('<html></html>'),
          },
        },
      ],
    }).compile();

    processor = module.get<MailProcessor>(MailProcessor);
    orchestrator = module.get(MailOrchestrator);
    templateService = module.get(TemplateService);
  });

  it('should process welcome job', async () => {
    const job = {
      name: 'welcome',
      data: { to: 'test@example.com', alias: 'test' },
    } as any;

    await processor.process(job);

    expect(templateService.render).toHaveBeenCalled();
    expect(orchestrator.send).toHaveBeenCalled();
  });
});
