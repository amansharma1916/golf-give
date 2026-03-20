// Stripe webhook handlers stub
// Implement customer.subscription.* and invoice.* events when going live

export interface StripeEvent {
  type: string;
  data: {
    object: any;
  };
}

export async function handleStripeEvent(event: StripeEvent): Promise<void> {
  console.log(`Received Stripe event: ${event.type}`);
  // Implement event handlers when going live
}
