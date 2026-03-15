import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { delivery_id, bid_id } = await request.json();

    if (!delivery_id || !bid_id) {
      return NextResponse.json(
        { error: "delivery_id and bid_id are required" },
        { status: 400 }
      );
    }

    // Verify the delivery belongs to this shipper
    const { data: delivery } = await supabase
      .from("deliveries")
      .select("*, bids(*)")
      .eq("id", delivery_id)
      .eq("shipper_id", user.id)
      .single();

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Get the accepted bid
    const { data: bid } = await supabase
      .from("bids")
      .select("*")
      .eq("id", bid_id)
      .eq("delivery_id", delivery_id)
      .single();

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Get the driver's Connect account for the transfer destination
    const { data: driverProfile } = await supabaseAdmin
      .from("driver_profiles")
      .select("stripe_connect_account_id")
      .eq("id", bid.driver_id)
      .single();

    if (!driverProfile?.stripe_connect_account_id) {
      return NextResponse.json(
        { error: "Driver has not set up payment account" },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(bid.amount * 100);

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        delivery_id,
        bid_id,
        shipper_id: user.id,
        driver_id: bid.driver_id,
        driver_connect_account: driverProfile.stripe_connect_account_id,
      },
    });

    // Create payment record using service role
    await supabaseAdmin.from("payments").insert({
      delivery_id,
      shipper_id: user.id,
      driver_id: bid.driver_id,
      amount: bid.amount,
      platform_fee: 0, // Flat fee model — no per-delivery platform cut
      driver_payout: bid.amount,
      stripe_payment_intent_id: paymentIntent.id,
      status: "pending",
    });

    // Update delivery: accept bid + assign driver
    await supabaseAdmin
      .from("deliveries")
      .update({
        status: "accepted",
        accepted_bid_id: bid_id,
        driver_id: bid.driver_id,
      })
      .eq("id", delivery_id);

    // Update bid status
    await supabaseAdmin
      .from("bids")
      .update({ status: "accepted" })
      .eq("id", bid_id);

    // Reject all other bids
    await supabaseAdmin
      .from("bids")
      .update({ status: "rejected" })
      .eq("delivery_id", delivery_id)
      .neq("id", bid_id);

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
