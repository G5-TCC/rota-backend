import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import * as path from 'path';

@Injectable()
export class TemplateService {
  async render(templateName: string, context: Record<string, any>): Promise<string> {
    // Como configuramos o nest-cli.json para mover os assets para o dist,
    // o caminho após o build será sempre este:
    const templatePath = path.join(process.cwd(), 'dist', 'mail', 'templates', `${templateName}.ejs`);
    return ejs.renderFile(templatePath, context);
  }
}
