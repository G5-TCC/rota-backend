export interface ITwoFactorStrategy {
  readonly name: string;
  generateCode(userId: string): Promise<string>;
  sendCode(userEmail: string, code: string): Promise<void>;
  verifyCode(providedCode: string, storedCode: string): boolean;
}
