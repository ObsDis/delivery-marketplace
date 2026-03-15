import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if driver already has a Connect account
    const { data: driverProfile } = await supabase
      .from("driver_profiles")
      .select("stripe_connect_account_id")
      .eq("id", user.id)
      .single();

    if (!driverProfile) {
      return NextResponse.json(
        { error: "Driver profile not found" },
        { status: 404 }
      );
    }

    let accountId = driverProfile.stripe_connect_account_id;

    if (!accountId) {
      // Create a new Connect Express account
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        metadata: {
          user_id: user.id,
        },
        capabilities: {
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      // Save to database using service role
      await supabaseAdmin
        .from("driver_profiles")
        .update({ stripe_connect_account_id: accountId })
        .eq("id", user.id);
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/driver/settings?connect=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/driver/settings?connect=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Connect account error:", error);
    return NextResponse.json(
      { error: "Failed to create Connect account" },
      { status: 500 }
    );
  }
}
