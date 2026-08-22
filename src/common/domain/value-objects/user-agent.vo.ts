export class UserAgent {
  private readonly value: string;

  constructor(userAgent: string = 'unknown') {
    this.value = userAgent || 'unknown';
  }

  toString(): string {
    return this.value;
  }
}
