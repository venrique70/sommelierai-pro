
import { NextRequest, NextResponse } from 'next/server';
import { handlePaypalWebhook } from '@/ai/flows/handle-paypal-webhook';

/**
 * Handles the incoming webhook from PayPal.
 * It triggers the Genkit flow to update the user's plan.
 * Note: PayPal webhook verification is complex and will be handled inside the flow.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const eventType = payload.event_type;

    console.log(`✅ PayPal webhook received: '${eventType}'`);

    // We are interested in successful subscription activations.
    if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const result = await handlePaypalWebhook(payload);

      if (!result.success) {
        console.error(`Flow failed to process PayPal webhook: ${result.message}`);
        // Still return 200 to PayPal to prevent retries, but log the error.
        return NextResponse.json({ message: 'Webhook received, but internal processing failed.' }, { status: 200 });
      }
    } else {
      console.log(`Ignoring PayPal event '${eventType}'.`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
  const err = error instanceof Error ? error : new Error('Unknown error');
  console.error('❌ Error processing PayPal webhook:', err);
  return NextResponse.json({ message: `Internal Server Error: ${err.message}` }, { status: 500 });
}}

