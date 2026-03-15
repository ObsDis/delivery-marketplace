"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Bid {
  id: string;
  amount: number;
  message: string | null;
  status: string;
  is_auto_quote: boolean;
  created_at: string;
  deliveries: {
    id: string;
    title: string;
    pickup_address: string;
    delivery_address: string;
    distance_miles: number | null;
    item_size: string;
    status: string;
  } | null;
}

const BID_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  withdrawn: "bg-gray-100 text-gray-500",
};

const FILTERS = ["all", "pending", "accepted", "rejected"] as const;

export default function BidManagementPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function loadBids() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("bids")
      .select("*, deliveries(id, title, pickup_address, delivery_address, distance_miles, item_size, status)")
      .eq("driver_id", user.id)
      .order("created_at", { ascending: false });

    setBids(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadBids();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function withdrawBid(bidId: string) {
    if (!confirm("Withdraw this bid?")) return;

    await supabase.from("bids").update({ status: "withdrawn" }).eq("id", bidId);
    loadBids();
  }

  const filtered = bids.filter((b) => filter === "all" || b.status === filter);

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
        <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">My bids</h1>
        <p className="mt-1 text-[15px] text-[#86868b]">Track all your bids and their status.</p>
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
          <h3 className="text-[15px] font-semibold text-[#1d1d1f]">No bids found</h3>
          <p className="mt-1 text-[13px] text-[#86868b]">
            {filter === "all" ? "Start bidding on deliveries to see them here." : `No ${filter} bids.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((bid) => (
            <div
              key={bid.id}
              className="rounded-2xl border border-black/5 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-black/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15px] font-semibold text-[#1d1d1f]">
                      {bid.deliveries?.title || "Unknown delivery"}
                    </h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${BID_STATUS_STYLES[bid.status] || "bg-gray-50 text-gray-700"}`}>
                      {bid.status}
                    </span>
                    {bid.is_auto_quote && (
                      <span className="rounded-full bg-[#0071e3]/10 px-2 py-0.5 text-[11px] font-medium text-[#0071e3]">Auto</span>
                    )}
                  </div>
                  {bid.deliveries && (
                    <div className="mt-2 flex flex-col gap-1 text-[13px] text-[#86868b]">
                      <div className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><circle cx="12" cy="12" r="3" /></svg>
                        <span className="truncate">{bid.deliveries.pickup_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        <span className="truncate">{bid.deliveries.delivery_address}</span>
                      </div>
                    </div>
                  )}
                  {bid.message && (
                    <p className="mt-2 text-[12px] italic text-[#86868b]">&ldquo;{bid.message}&rdquo;</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[20px] font-bold text-[#1d1d1f]">${bid.amount.toFixed(2)}</div>
                  <div className="mt-0.5 text-[11px] text-[#86868b]">
                    {new Date(bid.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {bid.deliveries && (
                <div className="mt-3 flex items-center gap-3 border-t border-black/5 pt-3 text-[12px] text-[#86868b]">
                  <span className="capitalize">{bid.deliveries.item_size.replace("_", " ")}</span>
                  {bid.deliveries.distance_miles && <span>{bid.deliveries.distance_miles} mi</span>}
                  <span className="capitalize">Delivery: {bid.deliveries.status.replace("_", " ")}</span>
                </div>
              )}

              {bid.status === "pending" && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => withdrawBid(bid.id)}
                    className="h-8 rounded-lg border border-red-200 px-4 text-[12px] font-medium text-red-600 transition-all hover:bg-red-50"
                  >
                    Withdraw bid
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
