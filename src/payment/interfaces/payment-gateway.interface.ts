export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';

export interface PaymentProduct {
  id: string;
  externalId: string;
}

export interface CheckoutResult {
  id: string;
  url: string;
}

export interface IPaymentGateway {
  createProduct(externalId: string, name: string, price: number): Promise<PaymentProduct>;
  findProductByExternalId(externalId: string): Promise<PaymentProduct | null>;
  createSubscription(items: { id: string; quantity: number }[], customer: any, urls: any): Promise<CheckoutResult>;
  createCheckout(items: { id: string; quantity: number }[], customer: any, urls: any): Promise<CheckoutResult>;
  verifyWebhook(signature: string, rawBody: string): boolean;
  simulatePayment(externalId: string): Promise<void>;
}
