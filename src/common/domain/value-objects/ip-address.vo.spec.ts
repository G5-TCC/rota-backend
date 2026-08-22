import { IpAddress } from './ip-address.vo';
import { BadRequestException } from '@nestjs/common';

describe('IpAddress Value Object', () => {
  it('should create a valid IPv4 address', () => {
    const ip = new IpAddress('127.0.0.1');
    expect(ip.toString()).toBe('127.0.0.1');
  });

  it('should accept localhost IPv6', () => {
    const ip = new IpAddress('::1');
    expect(ip.toString()).toBe('::1');
  });

  it('should throw BadRequestException for invalid format', () => {
    expect(() => new IpAddress('not-an-ip')).toThrow(BadRequestException);
    expect(() => new IpAddress('256.256.256.256')).toThrow(BadRequestException);
  });
});
