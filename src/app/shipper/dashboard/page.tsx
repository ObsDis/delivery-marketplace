"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

interface Profile {
  full_name: string;
}

interface Delivery {
  id: string;
  title: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
}

export default function ShipperDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState({ active: 0, delivered: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, recentRes, activeRes, deliveredRes, totalRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).single(),
        supabase.from("deliveries").select("id, title, status, pickup_address, delivery_address, created_at").eq("shipper_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("deliveries").select("id", { count: "exact", head: true }).eq("shipper_id", user.id).in("status", ["posted", "bidding", "accepted", "picked_up", "in_transit"]),
        supabase.from("deliveries").select("id", { count: "exact", head: true }).eq("shipper_id", user.id).eq("status", "delivered"),
        supabase.from("deliveries").select("id", { count: "exact", head: true }).eq("shipper_id", user.id),
      ]);

      setProfile(profileRes.data);
      setRecentDeliveries(recentRes.data || []);
      setStats({
        active: activeRes.count || 0,
        delivered: deliveredRes.count || 0,
        total: totalRes.count || 0,
      });
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

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const statusColors: Record<string, string> = {
    posted: "bg-blue-50 text-blue-700",
    bidding: "bg-purple-50 text-purple-700",
    accepted: "bg-yellow-50 text-yellow-700",
    picked_up: "bg-orange-50 text-orange-700",
    in_transit: "bg-indigo-50 text-indigo-700",
    delivered: "bg-green-50 text-green-700",
    canceled: "bg-red-50 text-red-700",
    disputed: "bg-red-50 text-red-700",
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">
            Hey, {firstName}
          </h1>
          <p className="mt-1 text-[15px] text-[#86868b]">
            Manage your deliveries and track shipments.
          </p>
        </div>
        <Link
          href="/shipper/create-delivery"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#0071e3] px-5 text-[13px] font-medium text-white transition-all hover:bg-[#0077ed] hover:shadow-lg hover:shadow-blue-500/25"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New delivery
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active", value: stats.active, color: "text-[#0071e3]" },
          { label: "Delivered", value: stats.delivered, color: "text-[#34c759]" },
          { label: "Total", value: stats.total, color: "text-[#1d1d1f]" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-black/5 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-black/5"
          >
            <p className="text-[12px] font-medium uppercase tracking-wider text-[#86868b]">
              {stat.label}
            </p>
            <p className={`mt-2 text-[28px] font-bold tracking-tight ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent deliveries */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[#1d1d1f]">
            Recent deliveries
          </h2>
          <Link
            href="/shipper/history"
            className="text-[13px] font-medium text-[#0071e3] hover:underline"
          >
            View all
          </Link>
        </div>

        {recentDeliveries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e5e5e7] bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0071e3]/10">
              <svg className="h-7 w-7 text-[#0071e3]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
              No deliveries yet
            </h3>
            <p className="mt-1 text-[13px] text-[#86868b]">
              Post your first delivery and get bids from drivers.
            </p>
            <Link
              href="/shipper/create-delivery"
              className="mt-4 inline-flex h-10 items-center rounded-full bg-[#0071e3] px-6 text-[13px] font-medium text-white transition-all hover:bg-[#0077ed]"
            >
              Create delivery
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white">
            {recentDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-[#fafafa]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f7]">
                  <svg className="h-5 w-5 text-[#86868b]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-[#1d1d1f]">
                    {delivery.title}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-[#86868b]">
                    {delivery.pickup_address} &rarr; {delivery.delivery_address}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    statusColors[delivery.status] || "bg-gray-50 text-gray-700"
                  }`}
                >
                  {delivery.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
