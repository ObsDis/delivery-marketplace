import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

// Disable body parsing — we need the raw body for signature verification
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error("No user_id in checkout session metadata");
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  // Update driver subscription status
  await supabaseAdmin
    .from("driver_profiles")
    .update({
      subscription_status: "active",
      subscription_id: subscriptionId,
    })
    .eq("id", userId);

  console.log(`Driver ${userId} subscription activated`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  // Find the driver with this subscription
  const { data: driver } = await supabaseAdmin
    .from("driver_profiles")
    .select("id")
    .eq("subscription_id", subscriptionId)
    .single();

  if (!driver) {
    console.error(`No driver found for subscription ${subscriptionId}`);
    return;
  }

  // Map Stripe status to our enum
  let status: string;
  switch (subscription.status) {
    case "active":
    case "trialing":
      status = "active";
      break;
    case "past_due":
      status = "past_due";
      break;
    case "canceled":
    case "unpaid":
      status = "canceled";
      break;
    default:
      status = "active";
  }

  await supabaseAdmin
    .from("driver_profiles")
    .update({ subscription_status: status })
    .eq("id", driver.id);

  console.log(`Driver ${driver.id} subscription updated to ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const { data: driver } = await supabaseAdmin
    .from("driver_profiles")
    .select("id")
    .eq("subscription_id", subscriptionId)
    .single();

  if (!driver) {
    console.error(`No driver found for subscription ${subscriptionId}`);
    return;
  }

  await supabaseAdmin
    .from("driver_profiles")
    .update({
      subscription_status: "canceled",
      subscription_id: null,
    })
    .eq("id", driver.id);

  console.log(`Driver ${driver.id} subscription canceled`);
}

async function handleAccountUpdated(account: Stripe.Account) {
  const userId = account.metadata?.user_id;
  if (!userId) return;

  // Log verification status changes
  const chargesEnabled = account.charges_enabled;
  const payoutsEnabled = account.payouts_enabled;

  console.log(
    `Connect account ${account.id} updated — charges: ${chargesEnabled}, payouts: ${payoutsEnabled}`
  );

  // You could store verification status in driver_profiles if needed
  // For now, we just log it. The account is ready when both are true.
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  const deliveryId = paymentIntent.metadata?.delivery_id;
  if (!deliveryId) {
    console.error("No delivery_id in payment intent metadata");
    return;
  }

  // Update payment status to charged
  await supabaseAdmin
    .from("payments")
    .update({ status: "charged" })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  console.log(`Payment for delivery ${deliveryId} charged successfully`);
}
