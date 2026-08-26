import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailOrchestrator } from '../services/mail.orchestrator';
import { MailOptions } from '../mail.interfaces';
import { TemplateService } from '../services/template.service';
import * as Sentry from '@sentry/nestjs';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private mailOrchestrator: MailOrchestrator,
    private templateService: TemplateService,
  ) {
    super();
  }

  async process(job: Job<MailOptions, any, string>): Promise<any> {
    const { requestId } = job.data;

    return Sentry.withScope(async (scope) => {
      if (requestId) {
        scope.setTag('requestId', requestId);
      }

      this.logger.log(
        { requestId },
        `Processing job ${job.id} for ${job.data.to}...`,
      );

      try {
        const html = await this.templateService.render(
          job.data.template,
          job.data.context,
        );

        await this.mailOrchestrator.send({
          ...job.data,
          html,
        });

        this.logger.log({ requestId }, `Successfully processed job ${job.id}`);
      } catch (error) {
        this.logger.error(
          { requestId },
          `Failed to process job ${job.id}: ${error.message}`,
        );
        throw error;
      }
    });
  }
}
