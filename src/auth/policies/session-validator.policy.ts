import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Session, User } from '@prisma/client';

export class SessionValidatorPolicy {
  static validate(
    session: (Session & { user: User }) | null,
    currentUserAgent: string,
  ): void {
    if (!session) {
      throw new UnauthorizedException('Sessão inválida ou token já utilizado');
    }

    if (this.isExpired(session.expiresAt)) {
      throw new UnauthorizedException('Sessão expirada');
    }

    if (session.userAgent !== currentUserAgent) {
      throw new UnauthorizedException('Contexto de dispositivo inválido');
    }
  }

  private static isExpired(expiresAt: Date): boolean {
    return expiresAt < new Date();
  }
}
