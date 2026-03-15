"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Delivery {
  id: string;
  title: string;
  description: string | null;
  item_size: string;
  item_weight_lbs: number | null;
  item_quantity: number;
  pickup_address: string;
  delivery_address: string;
  distance_miles: number | null;
  pickup_window_start: string | null;
  delivery_deadline: string | null;
  max_bid_amount: number | null;
  insurance_required: boolean;
  status: string;
  created_at: string;
  profiles: { full_name: string; } | null;
  bids: { id: string }[];
}

export default function DeliveryFeedPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("deliveries")
        .select("*, profiles!deliveries_shipper_id_fkey(full_name), bids(id)")
        .in("status", ["posted", "bidding"])
        .order("created_at", { ascending: false });

      setDeliveries(data || []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBid(deliveryId: string) {
    if (!userId || !bidAmount) return;

    const { error } = await supabase.from("bids").insert({
      delivery_id: deliveryId,
      driver_id: userId,
      amount: parseFloat(bidAmount),
      message: bidMessage || null,
      is_auto_quote: false,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setBidding(null);
    setBidAmount("");
    setBidMessage("");

    // Refresh deliveries
    const { data } = await supabase
      .from("deliveries")
      .select("*, profiles!deliveries_shipper_id_fkey(full_name), bids(id)")
      .in("status", ["posted", "bidding"])
      .order("created_at", { ascending: false });
    setDeliveries(data || []);
  }

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
        <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">Available deliveries</h1>
        <p className="mt-1 text-[15px] text-[#86868b]">Browse and bid on deliveries near you.</p>
      </div>

      {deliveries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e5e7] bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0071e3]/10">
            <svg className="h-7 w-7 text-[#0071e3]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f]">No deliveries available</h3>
          <p className="mt-1 text-[13px] text-[#86868b]">Check back soon for new delivery requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="rounded-2xl border border-black/5 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-black/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{delivery.title}</h3>
                    {delivery.insurance_required && (
                      <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[11px] font-medium text-yellow-700">Insured</span>
                    )}
                  </div>
                  {delivery.description && (
                    <p className="mt-1 text-[13px] text-[#86868b]">{delivery.description}</p>
                  )}
                </div>
                {delivery.max_bid_amount && (
                  <div className="shrink-0 text-right">
                    <div className="text-[11px] text-[#86868b]">Budget</div>
                    <div className="text-[20px] font-bold text-[#1d1d1f]">${delivery.max_bid_amount.toFixed(2)}</div>
                  </div>
                )}
              </div>

              {/* Route */}
              <div className="mt-4 flex flex-col gap-2 rounded-xl bg-[#f5f5f7] p-4">
                <div className="flex items-center gap-3 text-[13px]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0071e3] text-[10px] font-bold text-white">A</div>
                  <span className="text-[#1d1d1f]">{delivery.pickup_address}</span>
                </div>
                <div className="ml-3 h-4 border-l-2 border-dashed border-[#e5e5e7]" />
                <div className="flex items-center gap-3 text-[13px]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#34c759] text-[10px] font-bold text-white">B</div>
                  <span className="text-[#1d1d1f]">{delivery.delivery_address}</span>
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-[#86868b]">
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1 capitalize">{delivery.item_size.replace("_", " ")}</span>
                {delivery.distance_miles && <span className="rounded-full bg-[#f5f5f7] px-3 py-1">{delivery.distance_miles} mi</span>}
                {delivery.item_weight_lbs && <span className="rounded-full bg-[#f5f5f7] px-3 py-1">{delivery.item_weight_lbs} lbs</span>}
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1">Qty: {delivery.item_quantity}</span>
                {delivery.delivery_deadline && (
                  <span className="rounded-full bg-[#f5f5f7] px-3 py-1">
                    Due: {new Date(delivery.delivery_deadline).toLocaleDateString()}
                  </span>
                )}
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1">{delivery.bids?.length || 0} bids</span>
              </div>

              {/* Bid form */}
              {bidding === delivery.id ? (
                <div className="mt-4 border-t border-black/5 pt-4">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-[#86868b]">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white pl-8 pr-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                        placeholder="Your bid"
                        autoFocus
                      />
                    </div>
                    <input
                      type="text"
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      className="h-11 flex-1 rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                      placeholder="Note (optional)"
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleBid(delivery.id)}
                      disabled={!bidAmount}
                      className="h-10 rounded-xl bg-[#0071e3] px-6 text-[13px] font-medium text-white transition-all hover:bg-[#0077ed] disabled:opacity-50"
                    >
                      Submit bid
                    </button>
                    <button
                      onClick={() => { setBidding(null); setBidAmount(""); setBidMessage(""); }}
                      className="h-10 rounded-xl border border-[#e5e5e7] px-6 text-[13px] font-medium text-[#1d1d1f] transition-all hover:bg-[#f5f5f7]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                  <span className="text-[12px] text-[#86868b]">
                    Posted by {delivery.profiles?.full_name || "Unknown"} &middot; {new Date(delivery.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setBidding(delivery.id)}
                    className="h-9 rounded-xl bg-[#0071e3] px-5 text-[13px] font-medium text-white transition-all hover:bg-[#0077ed] hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    Place bid
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
