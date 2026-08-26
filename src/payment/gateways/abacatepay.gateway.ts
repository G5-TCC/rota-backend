import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import CircuitBreaker = require('opossum');
import {
  IPaymentGateway,
  PaymentProduct,
  CheckoutResult,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class AbacatePayGateway implements IPaymentGateway {
  private readonly logger = new Logger(AbacatePayGateway.name);
  private readonly baseUrl = 'https://api.abacatepay.com/v2';
  private readonly breaker: CircuitBreaker;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const options = {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    };
    this.breaker = new CircuitBreaker(this.executeRequest.bind(this), {
      ...options,
      errorFilter: (error) =>
        error.response?.data?.error?.includes('already exists'),
    });
    this.breaker.fallback(() => {
      this.logger.error('Circuit Breaker: AbacatePay service is unavailable');
      throw new ServiceUnavailableException(
        'Payment gateway is currently unavailable',
      );
    });
  }

  private async executeRequest(requestConfig: any): Promise<any> {
    return firstValueFrom(this.httpService.request(requestConfig));
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.configService.get('ABACATEPAY_API_KEY')}`,
      'Content-Type': 'application/json',
    };
  }

  async createProduct(
    externalId: string,
    name: string,
    price: number,
  ): Promise<PaymentProduct> {
    try {
      const response = await this.breaker.fire({
        url: `${this.baseUrl}/products/create`,
        method: 'POST',
        data: { externalId, name, price, currency: 'BRL', cycle: 'MONTHLY' },
        headers: this.headers,
      });
      return response.data.data;
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        return this.findProductByExternalId(
          externalId,
        ) as Promise<PaymentProduct>;
      }
      throw error;
    }
  }

  async findProductByExternalId(
    externalId: string,
  ): Promise<PaymentProduct | null> {
    try {
      const response = await this.breaker.fire({
        url: `${this.baseUrl}/products/list`,
        method: 'GET',
        headers: this.headers,
      });
      return (
        response.data.data.find((p: any) => p.externalId === externalId) || null
      );
    } catch {
      return null;
    }
  }

  async createSubscription(
    items: any[],
    customer: any,
    urls: any,
  ): Promise<CheckoutResult> {
    const response = await this.breaker.fire({
      url: `${this.baseUrl}/subscriptions/create`,
      method: 'POST',
      data: {
        items,
        customer,
        ...urls,
        frequency: 'SUBSCRIPTION',
        methods: ['CARD'],
      },
      headers: this.headers,
    });
    return response.data.data;
  }

  async createCheckout(
    items: any[],
    customer: any,
    urls: any,
  ): Promise<CheckoutResult> {
    const response = await this.breaker.fire({
      url: `${this.baseUrl}/checkouts/create`,
      method: 'POST',
      data: {
        items,
        customer,
        ...urls,
        frequency: 'ONE_TIME',
        methods: ['CARD'],
      },
      headers: this.headers,
    });
    return response.data.data;
  }

  verifyWebhook(signature: string, rawBody: string): boolean {
    const secret = this.configService.get<string>('ABACATEPAY_WEBHOOK_SECRET');
    if (!secret) return false;

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(digest),
        Buffer.from(signature),
      );
    } catch {
      return false;
    }
  }

  async simulatePayment(externalId: string): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/checkouts/simulate-payment`,
        { id: externalId, status: 'PAID' },
        { headers: this.headers },
      ),
    );
  }
}
