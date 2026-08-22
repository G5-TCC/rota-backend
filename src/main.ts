import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
// import './instrument'; // Carregado condicionalmente no bootstrap

// Fix para serialização de BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  if (process.env.ENABLE_SENTRY === 'true') {
    await import('./instrument.js');
  }

  const app = await NestFactory.create(AppModule, { rawBody: true, bufferLogs: true });
  
  app.useLogger(app.get(Logger));

  // Configuração do Helmet compatível com Swagger UI
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  }));

  app.use(cookieParser());
  app.enableCors({ credentials: true, origin: process.env.FRONTEND_URL });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  
  // Encerramento gracioso (Graceful Shutdown)
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Plataforma Backend API')
    .setDescription(`
      API de Autenticação e Gerenciamento de Segurança.
      
      ### Regras de Negócio:
      * **Autenticação**: Suporta JWT via Header (Bearer) e Refresh Token via HttpOnly Cookie.
      * **Segurança**: Detecção de novos dispositivos e 2FA obrigatório para logins suspeitos.
      * **Sessões**: Controle total sobre sessões ativas com possibilidade de revogação remota.
    `)
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Insira o Access Token obtido no login.',
    })
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description: 'Refresh Token enviado automaticamente via cookie.',
    })
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
    },
    customSiteTitle: 'Documentação API - Backend',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
