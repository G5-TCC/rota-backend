import { BadRequestException } from '@nestjs/common';

export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.value = email.toLowerCase().trim();
    this.validate(this.value);
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
