import { env } from '../env';

interface StripeClient {
  customers: {
    create: (params: any) => Promise<{ id: string }>;
    update: (id: string, params: any) => Promise<any>;
  };
  subscriptions: {
    create: (params: any) => Promise<any>;
    retrieve: (id: string) => Promise<any>;
  };
  checkout: {
    sessions: {
      create: (params: any) => Promise<{ id: string; url: string }>;
    };
  };
}

export function getStripeClient(): StripeClient | null {
  if (env.PAYMENT_MODE === 'demo') {
    return null;
  }

  // In live mode, import Stripe SDK and return initialized client
  // For now, return null as Stripe is not installed
  return null;
}
