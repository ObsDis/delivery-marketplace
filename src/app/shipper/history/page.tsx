"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Delivery {
  id: string;
  title: string;
  status: string;
  item_size: string;
  pickup_address: string;
  delivery_address: string;
  distance_miles: number | null;
  created_at: string;
  bids: { id: string }[];
  accepted_bid: { amount: number } | null;
}

const STATUS_COLORS: Record<string, string> = {
  posted: "bg-blue-50 text-blue-700",
  bidding: "bg-purple-50 text-purple-700",
  accepted: "bg-yellow-50 text-yellow-700",
  picked_up: "bg-orange-50 text-orange-700",
  in_transit: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  canceled: "bg-red-50 text-red-700",
  disputed: "bg-red-50 text-red-700",
};

const FILTERS = ["all", "active", "delivered", "canceled"] as const;

export default function ShipperHistoryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("deliveries")
        .select("id, title, status, item_size, pickup_address, delivery_address, distance_miles, created_at, bids(id), accepted_bid:bids!deliveries_accepted_bid_id_fkey(amount)")
        .eq("shipper_id", user.id)
        .order("created_at", { ascending: false });

      setDeliveries(data || []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = deliveries.filter((d) => {
    if (filter === "all") return true;
    if (filter === "active") return ["posted", "bidding", "accepted", "picked_up", "in_transit"].includes(d.status);
    if (filter === "delivered") return d.status === "delivered";
    if (filter === "canceled") return d.status === "canceled";
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">History</h1>
        <p className="mt-1 text-[15px] text-[#86868b]">All your past and current deliveries.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${
              filter === f
                ? "bg-[#0071e3] text-white"
                : "bg-white text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e7] bg-white p-12 text-center">
          <p className="text-[15px] font-medium text-[#1d1d1f]">No deliveries found</p>
          <p className="mt-1 text-[13px] text-[#86868b]">
            {filter === "all" ? "Create your first delivery to get started." : `No ${filter} deliveries.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((delivery) => (
            <div
              key={delivery.id}
              className="rounded-2xl border border-black/5 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-black/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15px] font-semibold text-[#1d1d1f]">{delivery.title}</h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLORS[delivery.status] || "bg-gray-50 text-gray-700"}`}>
                      {delivery.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col gap-1 text-[13px] text-[#86868b]">
                    <div className="flex items-center gap-2">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><circle cx="12" cy="12" r="3" /></svg>
                      <span className="truncate">{delivery.pickup_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      <span className="truncate">{delivery.delivery_address}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {delivery.accepted_bid?.[0] ? (
                    <div className="text-[17px] font-bold text-[#1d1d1f]">
                      ${(delivery.accepted_bid as unknown as { amount: number }[])?.[0]?.amount?.toFixed(2)}
                    </div>
                  ) : (
                    <div className="text-[13px] text-[#86868b]">
                      {delivery.bids?.length || 0} bid{delivery.bids?.length !== 1 ? "s" : ""}
                    </div>
                  )}
                  <div className="mt-1 text-[11px] text-[#86868b]">
                    {new Date(delivery.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {delivery.distance_miles && (
                <div className="mt-3 flex items-center gap-4 border-t border-black/5 pt-3 text-[12px] text-[#86868b]">
                  <span>{delivery.distance_miles} mi</span>
                  <span className="capitalize">{delivery.item_size.replace("_", " ")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
