import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain.error';

export class BusinessRuleError extends DomainError {
  constructor(
    message: string,
    private readonly code = 'BUSINESS_RULE_VIOLATION',
  ) {
    super(message);
  }

  get statusCode() {
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }

  get errorCode() {
    return this.code;
  }
}
