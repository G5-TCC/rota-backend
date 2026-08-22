import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/services/mail.service';

@Injectable()
export class SecurityMonitorService {
  private readonly logger = new Logger(SecurityMonitorService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async monitorLogin(userId: string, userAgent: string, email: string) {
    const fingerprint = this.generateFingerprint(userAgent);
    
    const device = await this.prisma.knownDevice.findUnique({
      where: { userId_deviceFingerprint: { userId, deviceFingerprint: fingerprint } }
    });

    if (!device) {
      await this.handleNewDevice(userId, fingerprint, email);
    } else {
      await this.prisma.knownDevice.update({
        where: { id: device.id },
        data: { lastUsed: new Date() }
      });
    }
  }

  private generateFingerprint(userAgent: string): string {
    // Usar hash simples ou o próprio UA limpo
    return Buffer.from(userAgent).toString('base64').substring(0, 50);
  }

  private async handleNewDevice(userId: string, fingerprint: string, email: string) {
    this.logger.warn(`Novo dispositivo detectado para o usuário ${userId}`);
    
    await this.prisma.knownDevice.create({
      data: { userId, deviceFingerprint: fingerprint }
    });

    await this.mailService.sendSecurityAlert(email, 'Novo dispositivo detectado');
  }

  async logAction(userId: string, action: string, details: any, ip: string, ua: string) {
    await this.prisma.auditLog.create({
      data: { userId, action, details, ipAddress: ip, userAgent: ua }
    });
  }
}
