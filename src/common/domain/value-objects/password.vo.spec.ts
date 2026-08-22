import { Password } from './password.vo';
import { BadRequestException } from '@nestjs/common';

describe('Password Value Object', () => {
  it('should create a valid password', () => {
    const password = new Password('password123');
    expect(password.toString()).toBe('password123');
  });

  it('should throw BadRequestException if password is too short', () => {
    expect(() => new Password('short')).toThrow(BadRequestException);
  });
});
