"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

interface Profile {
  full_name: string;
  email: string;
}

interface DriverProfile {
  subscription_status: string;
  rating_avg: number;
  rating_count: number;
  is_active: boolean;
}

export default function DriverDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [activeBids, setActiveBids] = useState(0);
  const [activeDeliveries, setActiveDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, driverRes, bidsRes, deliveriesRes] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
        supabase.from("driver_profiles").select("subscription_status, rating_avg, rating_count, is_active").eq("id", user.id).single(),
        supabase.from("bids").select("id", { count: "exact", head: true }).eq("driver_id", user.id).eq("status", "pending"),
        supabase.from("deliveries").select("id", { count: "exact", head: true }).eq("driver_id", user.id).in("status", ["accepted", "picked_up", "in_transit"]),
      ]);

      setProfile(profileRes.data);
      setDriverProfile(driverRes.data);
      setActiveBids(bidsRes.count || 0);
      setActiveDeliveries(deliveriesRes.count || 0);
      setLoading(false);
    }

    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Driver";
  const subStatus = driverProfile?.subscription_status || "none";

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">
          Hey, {firstName}
        </h1>
        <p className="mt-1 text-[15px] text-[#86868b]">
          Here&apos;s what&apos;s happening with your deliveries today.
        </p>
      </div>

      {/* Subscription banner */}
      {subStatus !== "active" && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#1d1d1f] to-[#333] p-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[17px] font-semibold">
                {subStatus === "trial" ? "You're on a free trial" : "Subscribe to start earning"}
              </h3>
              <p className="mt-1 text-[13px] text-white/60">
                $99/month. Keep 100% of every delivery. No commission ever.
              </p>
            </div>
            <button
              onClick={async () => {
                const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              }}
              className="shrink-0 rounded-full bg-white px-6 py-2.5 text-[13px] font-semibold text-[#1d1d1f] transition-all hover:bg-white/90"
            >
              {subStatus === "trial" ? "Upgrade now" : "Subscribe — $99/mo"}
            </button>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Subscription",
            value: subStatus === "active" ? "Active" : subStatus === "trial" ? "Trial" : "Inactive",
            color: subStatus === "active" ? "text-[#34c759]" : subStatus === "trial" ? "text-[#ff9f0a]" : "text-[#ff3b30]",
          },
          { label: "Active deliveries", value: activeDeliveries.toString(), color: "text-[#1d1d1f]" },
          { label: "Pending bids", value: activeBids.toString(), color: "text-[#1d1d1f]" },
          {
            label: "Rating",
            value: driverProfile?.rating_count ? `${driverProfile.rating_avg}/5` : "No ratings yet",
            color: "text-[#1d1d1f]",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-black/5 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-black/5"
          >
            <p className="text-[12px] font-medium uppercase tracking-wider text-[#86868b]">
              {stat.label}
            </p>
            <p className={`mt-2 text-[22px] font-bold tracking-tight ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/driver/delivery-feed"
          className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-6 transition-all hover:border-[#0071e3]/20 hover:shadow-lg hover:shadow-black/5"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3] transition-colors group-hover:bg-[#0071e3] group-hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Find deliveries</h3>
            <p className="mt-0.5 text-[13px] text-[#86868b]">Browse available jobs near you</p>
          </div>
        </Link>
        <Link
          href="/driver/bid-management"
          className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-6 transition-all hover:border-[#0071e3]/20 hover:shadow-lg hover:shadow-black/5"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3] transition-colors group-hover:bg-[#0071e3] group-hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">My bids</h3>
            <p className="mt-0.5 text-[13px] text-[#86868b]">Track your pending and accepted bids</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
