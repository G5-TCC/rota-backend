import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request as NestRequest,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { SecurityFacade } from '../services/security.facade';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import '../interfaces/express-request.interface';

@ApiTags('Configuração')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('config')
@UseInterceptors(TransformInterceptor)
export class ConfigController {
  constructor(private readonly securityFacade: SecurityFacade) {}

  @Get('security/status')
  @ApiOperation({ summary: 'Obter status de segurança atual' })
  async getStatus(@NestRequest() req: Request) {
    return this.securityFacade.getSecurityStatus(req.user.sub);
  }

  @Post('security/2fa/enable')
  @ApiOperation({ summary: 'Ativar autenticação de dois fatores' })
  @ApiOkResponse({ description: '2FA ativado com sucesso.' })
  async enable2fa(@NestRequest() req: Request) {
    return this.securityFacade.enable2fa(req.user.sub);
  }

  @Delete('security/2fa/disable')
  @ApiOperation({ summary: 'Desativar autenticação de dois fatores' })
  @ApiOkResponse({ description: '2FA desativado com sucesso.' })
  async disable2fa(@NestRequest() req: Request) {
    return this.securityFacade.disable2fa(req.user.sub);
  }
}
