import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId: string; refreshToken: string; ipAddress: string; userAgent: string; expiresAt: Date }) {
    return this.prisma.session.create({ data });
  }

  async findUniqueWithUser(refreshToken: string) {
    return this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });
  }

  async update(id: string, data: { refreshToken: string; expiresAt: Date }) {
    return this.prisma.session.update({
      where: { id },
      data,
    });
  }

  async deleteManyByToken(refreshToken: string) {
    return this.prisma.session.deleteMany({ where: { refreshToken } });
  }

  async findByUserId(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      select: { id: true, userAgent: true, ipAddress: true, createdAt: true, updatedAt: true },
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.session.deleteMany({
      where: { id, userId },
    });
  }

  async deleteOthers(userId: string, currentSessionId: string) {
    return this.prisma.session.deleteMany({
      where: { userId, id: { not: currentSessionId } },
    });
  }

  async deleteAllByUserId(userId: string) {
    return this.prisma.session.deleteMany({
      where: { userId },
    });
  }
}
