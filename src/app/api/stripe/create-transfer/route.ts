import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job or internal service
    // Verify with a secret header
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { delivery_id } = await request.json();

    if (!delivery_id) {
      return NextResponse.json(
        { error: "delivery_id is required" },
        { status: 400 }
      );
    }

    // Get the payment record
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("delivery_id", delivery_id)
      .eq("status", "charged")
      .single();

    if (!payment) {
      return NextResponse.json(
        { error: "No charged payment found for this delivery" },
        { status: 404 }
      );
    }

    // Get driver's Connect account
    const { data: driverProfile } = await supabaseAdmin
      .from("driver_profiles")
      .select("stripe_connect_account_id")
      .eq("id", payment.driver_id)
      .single();

    if (!driverProfile?.stripe_connect_account_id) {
      return NextResponse.json(
        { error: "Driver Connect account not found" },
        { status: 400 }
      );
    }

    const payoutAmountCents = Math.round(payment.driver_payout * 100);

    // Create the transfer to the driver's Connect account
    const transfer = await stripe.transfers.create({
      amount: payoutAmountCents,
      currency: "usd",
      destination: driverProfile.stripe_connect_account_id,
      metadata: {
        delivery_id,
        payment_id: payment.id,
        driver_id: payment.driver_id,
      },
    });

    // Update payment record
    await supabaseAdmin
      .from("payments")
      .update({
        stripe_transfer_id: transfer.id,
        status: "paid_out",
      })
      .eq("id", payment.id);

    return NextResponse.json({
      transfer_id: transfer.id,
      amount: payment.driver_payout,
    });
  } catch (error) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
