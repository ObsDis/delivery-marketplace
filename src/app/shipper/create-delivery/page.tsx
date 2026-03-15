"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const ITEM_SIZES = [
  { value: "small", label: "Small", desc: "Fits in a backpack", example: "Documents, small electronics" },
  { value: "medium", label: "Medium", desc: "Fits in a car seat", example: "Boxes, small furniture" },
  { value: "large", label: "Large", desc: "Needs a trunk", example: "Large boxes, appliances" },
  { value: "xl", label: "XL", desc: "Needs a pickup/SUV", example: "Furniture, large equipment" },
  { value: "xxl", label: "XXL", desc: "Needs a cargo van", example: "Multiple large items" },
  { value: "full_van", label: "Full Van", desc: "Full van load", example: "Moving, bulk shipments" },
];

export default function CreateDeliveryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: "",
    description: "",
    item_size: "medium",
    item_weight_lbs: "",
    item_quantity: "1",
    pickup_address: "",
    delivery_address: "",
    pickup_window_start: "",
    pickup_window_end: "",
    delivery_deadline: "",
    budget: "",
    insurance_required: false,
    insurance_value: "",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  function updateForm(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("deliveries").insert({
      shipper_id: user.id,
      title: form.title,
      description: form.description || null,
      item_size: form.item_size,
      item_weight_lbs: form.item_weight_lbs ? parseFloat(form.item_weight_lbs) : null,
      item_quantity: parseInt(form.item_quantity) || 1,
      pickup_address: form.pickup_address,
      delivery_address: form.delivery_address,
      pickup_window_start: form.pickup_window_start || null,
      pickup_window_end: form.pickup_window_end || null,
      delivery_deadline: form.delivery_deadline || null,
      max_bid_amount: form.budget ? parseFloat(form.budget) : null,
      insurance_required: form.insurance_required,
      insurance_value: form.insurance_value ? parseFloat(form.insurance_value) : null,
      status: "posted",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/shipper/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">
          New delivery
        </h1>
        <p className="mt-1 text-[15px] text-[#86868b]">
          Describe your shipment and get competitive bids from drivers.
        </p>
      </div>

      {/* Progress steps */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold transition-all ${
                step === s
                  ? "bg-[#0071e3] text-white"
                  : step > s
                    ? "bg-[#34c759] text-white"
                    : "bg-[#e5e5e7] text-[#86868b]"
              }`}
            >
              {step > s ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              ) : s}
            </button>
            {s < 3 && <div className={`h-0.5 w-12 rounded ${step > s ? "bg-[#34c759]" : "bg-[#e5e5e7]"}`} />}
          </div>
        ))}
        <span className="ml-2 text-[13px] text-[#86868b]">
          {step === 1 ? "Package details" : step === 2 ? "Locations & timing" : "Budget & options"}
        </span>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Package Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h2 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">What are you shipping?</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                    placeholder="e.g. Couch delivery from IKEA"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">
                    Description <span className="font-normal text-[#86868b]">(optional)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-[#e5e5e7] bg-white px-4 py-3 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                    placeholder="Any special instructions or details..."
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h2 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">Package size</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ITEM_SIZES.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => updateForm("item_size", size.value)}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      form.item_size === size.value
                        ? "border-[#0071e3] bg-[#0071e3]/5"
                        : "border-[#e5e5e7] hover:border-[#c5c5c7]"
                    }`}
                  >
                    <div className="text-[13px] font-semibold text-[#1d1d1f]">{size.label}</div>
                    <div className="mt-0.5 text-[11px] text-[#86868b]">{size.desc}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">
                    Weight (lbs) <span className="font-normal text-[#86868b]">optional</span>
                  </label>
                  <input
                    type="number"
                    value={form.item_weight_lbs}
                    onChange={(e) => updateForm("item_weight_lbs", e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={form.item_quantity}
                    onChange={(e) => updateForm("item_quantity", e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-11 w-full rounded-xl bg-[#0071e3] text-[15px] font-medium text-white transition-all hover:bg-[#0077ed] hover:shadow-lg hover:shadow-blue-500/25"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Locations & Timing */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h2 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">Pickup location</h2>
              <input
                type="text"
                value={form.pickup_address}
                onChange={(e) => updateForm("pickup_address", e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                placeholder="Enter pickup address"
              />
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h2 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">Delivery location</h2>
              <input
                type="text"
                value={form.delivery_address}
                onChange={(e) => updateForm("delivery_address", e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                placeholder="Enter delivery address"
              />
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h2 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">Timing</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Pickup from</label>
                    <input
                      type="datetime-local"
                      value={form.pickup_window_start}
                      onChange={(e) => updateForm("pickup_window_start", e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Pickup until</label>
                    <input
                      type="datetime-local"
                      value={form.pickup_window_end}
                      onChange={(e) => updateForm("pickup_window_end", e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Deliver by</label>
                  <input
                    type="datetime-local"
                    value={form.delivery_deadline}
                    onChange={(e) => updateForm("delivery_deadline", e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 flex-1 rounded-xl border border-[#e5e5e7] text-[15px] font-medium text-[#1d1d1f] transition-all hover:bg-[#f5f5f7]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-11 flex-1 rounded-xl bg-[#0071e3] text-[15px] font-medium text-white transition-all hover:bg-[#0077ed] hover:shadow-lg hover:shadow-blue-500/25"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Budget & Options */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h2 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">Budget</h2>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">
                  Maximum you&apos;re willing to pay
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-[#86868b]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.budget}
                    onChange={(e) => updateForm("budget", e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white pl-8 pr-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1.5 text-[12px] text-[#86868b]">
                  Drivers will bid at or below this amount. Leave blank to receive open bids.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h2 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">Insurance</h2>
              <label className="flex cursor-pointer items-center justify-between">
                <div>
                  <div className="text-[14px] font-medium text-[#1d1d1f]">Require insurance</div>
                  <div className="text-[12px] text-[#86868b]">Driver must have insurance coverage</div>
                </div>
                <div
                  onClick={() => updateForm("insurance_required", !form.insurance_required)}
                  className={`relative h-7 w-12 cursor-pointer rounded-full transition-colors ${
                    form.insurance_required ? "bg-[#34c759]" : "bg-[#e5e5e7]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                      form.insurance_required ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </label>
              {form.insurance_required && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Declared value</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-[#86868b]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.insurance_value}
                      onChange={(e) => updateForm("insurance_value", e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white pl-8 pr-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-[#0071e3]/20 bg-[#0071e3]/5 p-6">
              <h2 className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">Summary</h2>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between"><span className="text-[#86868b]">Item</span><span className="font-medium text-[#1d1d1f]">{form.title || "—"}</span></div>
                <div className="flex justify-between"><span className="text-[#86868b]">Size</span><span className="font-medium text-[#1d1d1f]">{ITEM_SIZES.find(s => s.value === form.item_size)?.label}</span></div>
                <div className="flex justify-between"><span className="text-[#86868b]">From</span><span className="truncate ml-4 max-w-[200px] font-medium text-[#1d1d1f]">{form.pickup_address || "—"}</span></div>
                <div className="flex justify-between"><span className="text-[#86868b]">To</span><span className="truncate ml-4 max-w-[200px] font-medium text-[#1d1d1f]">{form.delivery_address || "—"}</span></div>
                {form.budget && <div className="flex justify-between"><span className="text-[#86868b]">Budget</span><span className="font-medium text-[#1d1d1f]">${parseFloat(form.budget).toFixed(2)}</span></div>}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 flex-1 rounded-xl border border-[#e5e5e7] text-[15px] font-medium text-[#1d1d1f] transition-all hover:bg-[#f5f5f7]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-11 flex-1 rounded-xl bg-[#0071e3] text-[15px] font-medium text-white transition-all hover:bg-[#0077ed] hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post delivery"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
