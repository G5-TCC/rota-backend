import { HttpStatus } from '@nestjs/common';
import { DomainError } from './domain.error';

export class EntityNotFoundError extends DomainError {
  constructor(message = 'Recurso não encontrado') {
    super(message);
  }

  get statusCode() {
    return HttpStatus.NOT_FOUND;
  }

  get errorCode() {
    return 'ENTITY_NOT_FOUND';
  }
}
