export class UserCreatedEvent {
  constructor(
    public readonly email: string,
    public readonly verificationToken: string,
    public readonly requestId?: string,
  ) {}
}
