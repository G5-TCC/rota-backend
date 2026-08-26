export interface JwtPayload {
  sub: string;
  role: string;
  isVerified: boolean;
  sessionId: string;
}

declare module 'express' {
  interface Request {
    user: JwtPayload;
  }
}
