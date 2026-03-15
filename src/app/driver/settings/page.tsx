"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const VEHICLE_TYPES = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "pickup", label: "Pickup Truck" },
  { value: "cargo_van", label: "Cargo Van" },
  { value: "box_truck", label: "Box Truck" },
];

export default function DriverSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    vehicle_type: "sedan",
    service_zip_codes: "",
    is_active: true,
    subscription_status: "",
    stripe_connect_account_id: "",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, driverRes] = await Promise.all([
        supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).single(),
        supabase.from("driver_profiles").select("vehicle_type, service_zip_codes, is_active, subscription_status, stripe_connect_account_id").eq("id", user.id).single(),
      ]);

      setForm({
        full_name: profileRes.data?.full_name || "",
        email: profileRes.data?.email || "",
        phone: profileRes.data?.phone || "",
        vehicle_type: driverRes.data?.vehicle_type || "sedan",
        service_zip_codes: (driverRes.data?.service_zip_codes || []).join(", "),
        is_active: driverRes.data?.is_active ?? true,
        subscription_status: driverRes.data?.subscription_status || "none",
        stripe_connect_account_id: driverRes.data?.stripe_connect_account_id || "",
      });
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const zipCodes = form.service_zip_codes
      .split(",")
      .map((z) => z.trim())
      .filter(Boolean);

    await Promise.all([
      supabase.from("profiles").update({
        full_name: form.full_name,
        phone: form.phone || null,
      }).eq("id", user.id),
      supabase.from("driver_profiles").update({
        vehicle_type: form.vehicle_type,
        service_zip_codes: zipCodes,
        is_active: form.is_active,
      }).eq("id", user.id),
    ]);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleConnectSetup() {
    setConnectLoading(true);
    const res = await fetch("/api/stripe/create-connect-account", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Failed to set up payment account");
      setConnectLoading(false);
    }
  }

  async function handleSubscribe() {
    const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">Settings</h1>
        <p className="mt-1 text-[15px] text-[#86868b]">Manage your profile, vehicle, and payment settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <div className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Full name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Email</label>
              <input
                type="email"
                value={form.email}
                disabled
                className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-[#f5f5f7] px-4 text-[15px] text-[#86868b] outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Vehicle */}
        <div className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">Vehicle</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">Vehicle type</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {VEHICLE_TYPES.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => setForm({ ...form, vehicle_type: v.value })}
                    className={`rounded-xl border-2 px-3 py-2.5 text-[13px] font-medium transition-all ${
                      form.vehicle_type === v.value
                        ? "border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]"
                        : "border-[#e5e5e7] text-[#1d1d1f] hover:border-[#c5c5c7]"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Service zip codes</label>
              <input
                type="text"
                value={form.service_zip_codes}
                onChange={(e) => setForm({ ...form, service_zip_codes: e.target.value })}
                className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                placeholder="10001, 10002, 10003"
              />
              <p className="mt-1 text-[12px] text-[#86868b]">Comma-separated zip codes you serve.</p>
            </div>
            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <div className="text-[14px] font-medium text-[#1d1d1f]">Available for deliveries</div>
                <div className="text-[12px] text-[#86868b]">Toggle off to pause receiving new bids</div>
              </div>
              <div
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className={`relative h-7 w-12 cursor-pointer rounded-full transition-colors ${
                  form.is_active ? "bg-[#34c759]" : "bg-[#e5e5e7]"
                }`}
              >
                <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="h-11 w-full rounded-xl bg-[#0071e3] text-[15px] font-medium text-white transition-all hover:bg-[#0077ed] hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
        </button>
      </form>

      {/* Subscription */}
      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-1 text-[17px] font-semibold text-[#1d1d1f]">Subscription</h2>
        <p className="mb-4 text-[13px] text-[#86868b]">$99/month. Keep 100% of delivery earnings.</p>
        <div className="flex items-center justify-between rounded-xl bg-[#f5f5f7] p-4">
          <div>
            <div className="text-[14px] font-medium text-[#1d1d1f]">Status</div>
            <div className={`text-[13px] font-medium capitalize ${
              form.subscription_status === "active" ? "text-[#34c759]" :
              form.subscription_status === "trial" ? "text-[#ff9f0a]" :
              "text-[#ff3b30]"
            }`}>
              {form.subscription_status || "None"}
            </div>
          </div>
          {form.subscription_status !== "active" && (
            <button
              onClick={handleSubscribe}
              className="h-9 rounded-xl bg-[#0071e3] px-5 text-[13px] font-medium text-white transition-all hover:bg-[#0077ed]"
            >
              Subscribe
            </button>
          )}
        </div>
      </div>

      {/* Stripe Connect */}
      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="mb-1 text-[17px] font-semibold text-[#1d1d1f]">Payment account</h2>
        <p className="mb-4 text-[13px] text-[#86868b]">Set up your Stripe account to receive payouts.</p>
        <div className="flex items-center justify-between rounded-xl bg-[#f5f5f7] p-4">
          <div>
            <div className="text-[14px] font-medium text-[#1d1d1f]">Stripe Connect</div>
            <div className={`text-[13px] font-medium ${form.stripe_connect_account_id ? "text-[#34c759]" : "text-[#ff9f0a]"}`}>
              {form.stripe_connect_account_id ? "Connected" : "Not connected"}
            </div>
          </div>
          <button
            onClick={handleConnectSetup}
            disabled={connectLoading}
            className="h-9 rounded-xl bg-[#0071e3] px-5 text-[13px] font-medium text-white transition-all hover:bg-[#0077ed] disabled:opacity-50"
          >
            {connectLoading ? "Loading..." : form.stripe_connect_account_id ? "Update account" : "Set up payouts"}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-12 rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="text-[17px] font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-[13px] text-red-600/70">Permanently delete your account and all associated data.</p>
        <button
          onClick={async () => {
            if (!confirm("Are you sure? This will permanently delete your account.")) return;
            await supabase.auth.signOut();
            router.push("/");
          }}
          className="mt-4 h-10 rounded-xl border border-red-300 px-5 text-[13px] font-medium text-red-700 transition-all hover:bg-red-100"
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
