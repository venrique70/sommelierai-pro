
import {NextRequest, NextResponse} from 'next/server';
import crypto from 'crypto';
import { handleLemonSqueezyWebhook } from '@/ai/flows/handle-lemon-squeezy-webhook';

const secret = process.env.LEMONSQUEEZY_SIGNING_SECRET;

/**
 * Handles the incoming webhook from Lemon Squeezy.
 * It verifies the signature and then triggers the Genkit flow to update the user's plan.
 */
export async function POST(req: NextRequest) {
  if (!secret) {
    console.error('LEMONSQUEEZY_SIGNING_SECRET is not set in environment variables.');
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  try {
    // 1. Get the signature from the headers
    const signature = req.headers.get('x-signature');
    if (!signature) {
      console.warn('Webhook received without a signature.');
      return NextResponse.json({ message: 'Signature missing.' }, { status: 400 });
    }

    // 2. Get the raw request body
    const rawBody = await req.text();

    // 3. Verify the signature
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      console.warn('Invalid webhook signature. Possible tampering attempt.');
      return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
    }

    // 4. Parse the body and extract relevant data
    const body = JSON.parse(rawBody);

    const eventName = body.meta?.event_name;
    // According to Lemon Squeezy docs, the plan name is in `variant_name` for subscriptions
    const planName = body.data?.attributes?.variant_name; 
    const userEmail = body.data?.attributes?.user_email;

    console.log(`✅ Valid webhook received: '${eventName}' for user '${userEmail}' with plan '${planName}'`);

    // We are interested in subscription creation and updates
    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
        if (!userEmail || !planName) {
            console.error('Webhook is missing user email or plan name.', { userEmail, planName });
            return NextResponse.json({ message: 'Missing required data in webhook payload.' }, { status: 400 });
        }
        
        // 5. Call the Genkit flow to handle the logic
        const result = await handleLemonSqueezyWebhook({
            user_email: userEmail,
            plan_name: planName
        });

        if (!result.success) {
            console.error(`Flow failed to process webhook: ${result.message}`);
            // Still return 200 to Lemon Squeezy to prevent retries, but log the error.
            return NextResponse.json({ message: 'Webhook received, but internal processing failed.' }, { status: 200 });
        }

    } else {
        console.log(`Ignoring event '${eventName}' as it's not a subscription creation or update.`);
    }

    // 6. Respond with a success message
    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error('❌ Error processing Lemon Squeezy webhook:', error);
    return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
