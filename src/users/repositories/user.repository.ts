import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findUniqueByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findFirstByEmailOrAlias(email: string, alias: string) {
    return this.prisma.user.findFirst({
      where: { OR: [{ email }, { alias }] },
    });
  }

  async create(data: {
    email: string;
    alias: string;
    password: string;
    verificationToken: string;
  }) {
    return this.prisma.user.create({
      data,
      select: { id: true, email: true, alias: true, role: true },
    });
  }

  async findByToken(verificationToken: string) {
    return this.prisma.user.findUnique({ where: { verificationToken } });
  }

  async update(
    id: string,
    data: {
      password?: string;
      isVerified?: boolean;
      verificationToken?: string | null;
      is2faEnabled?: boolean;
      twoFactorCode?: string | null;
      twoFactorExpiresAt?: Date | null;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async update2faCode(id: string, code: string, expiresAt: Date) {
    return this.prisma.user.update({
      where: { id },
      data: { twoFactorCode: code, twoFactorExpiresAt: expiresAt },
    });
  }

  async clear2faCode(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { twoFactorCode: null, twoFactorExpiresAt: null },
    });
  }

  async findKnownDevice(userId: string, deviceFingerprint: string) {
    return this.prisma.knownDevice.findUnique({
      where: { userId_deviceFingerprint: { userId, deviceFingerprint } },
    });
  }

  async createKnownDevice(userId: string, deviceFingerprint: string) {
    return this.prisma.knownDevice.create({
      data: { userId, deviceFingerprint },
    });
  }
}
