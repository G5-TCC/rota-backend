export class TwoFactorCodeGeneratedEvent {
  constructor(
    public readonly email: string,
    public readonly code: string,
    public readonly requestId?: string,
  ) {}
}
