import { Email } from './email.vo';
import { BadRequestException } from '@nestjs/common';

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const email = new Email('TEST@example.com ');
    expect(email.toString()).toBe('test@example.com');
  });

  it('should throw BadRequestException for invalid email', () => {
    expect(() => new Email('invalid-email')).toThrow(BadRequestException);
    expect(() => new Email('test@')).toThrow(BadRequestException);
  });

  it('should compare two emails correctly', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('test@example.com');
    const email3 = new Email('other@example.com');

    expect(email1.equals(email2)).toBe(true);
    expect(email1.equals(email3)).toBe(false);
  });
});
