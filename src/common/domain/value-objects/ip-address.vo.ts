import { BadRequestException } from '@nestjs/common';

export class IpAddress {
  private readonly value: string;

  constructor(ip: string) {
    this.validate(ip);
    this.value = ip;
  }

  private validate(ip: string): void {
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (!ipv4Regex.test(ip) && !ip.includes(':')) {
      throw new BadRequestException('Invalid IP Address format');
    }
  }

  toString(): string {
    return this.value;
  }
}
