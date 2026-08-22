export interface AuthenticatedUser {
  id: string;
  email: string;
  alias: string;
  password?: string;
  role: string;
  isVerified: boolean;
  is2faEnabled: boolean;
  twoFactorCode?: string | null;
  twoFactorExpiresAt?: Date | null;
}
