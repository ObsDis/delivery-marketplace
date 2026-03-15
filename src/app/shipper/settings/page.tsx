"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function ShipperSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    company_address: "",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, shipperRes] = await Promise.all([
        supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).single(),
        supabase.from("shipper_profiles").select("company_name, company_address").eq("id", user.id).single(),
      ]);

      setForm({
        full_name: profileRes.data?.full_name || "",
        email: profileRes.data?.email || "",
        phone: profileRes.data?.phone || "",
        company_name: shipperRes.data?.company_name || "",
        company_address: shipperRes.data?.company_address || "",
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

    await Promise.all([
      supabase.from("profiles").update({
        full_name: form.full_name,
        phone: form.phone || null,
      }).eq("id", user.id),
      supabase.from("shipper_profiles").update({
        company_name: form.company_name || null,
        company_address: form.company_address || null,
      }).eq("id", user.id),
    ]);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you sure? This will permanently delete your account and all data.")) return;
    await supabase.auth.signOut();
    router.push("/");
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
        <p className="mt-1 text-[15px] text-[#86868b]">Manage your account and company details.</p>
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
              <p className="mt-1 text-[12px] text-[#86868b]">Email cannot be changed here.</p>
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

        {/* Company */}
        <div className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">Company</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Company name</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                placeholder="Your company name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Company address</label>
              <input
                type="text"
                value={form.company_address}
                onChange={(e) => setForm({ ...form, company_address: e.target.value })}
                className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                placeholder="123 Main St, City, State"
              />
            </div>
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

      {/* Danger zone */}
      <div className="mt-12 rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="text-[17px] font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-[13px] text-red-600/70">Permanently delete your account and all associated data.</p>
        <button
          onClick={handleDeleteAccount}
          className="mt-4 h-10 rounded-xl border border-red-300 px-5 text-[13px] font-medium text-red-700 transition-all hover:bg-red-100"
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
