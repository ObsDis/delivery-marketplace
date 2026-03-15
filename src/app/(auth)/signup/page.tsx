"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"shipper" | "driver">("shipper");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
          role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      if (role === "driver") {
        router.push("/driver/dashboard");
      } else {
        router.push("/shipper/dashboard");
      }
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6">
        <div className="w-full max-w-[360px] text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#0071e3]/10">
            <svg className="h-8 w-8 text-[#0071e3]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold tracking-tight text-[#1d1d1f]">
            Check your email
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#86868b]">
            We sent a confirmation link to{" "}
            <span className="font-medium text-[#1d1d1f]">{email}</span>.
            Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-11 items-center rounded-xl bg-[#0071e3] px-8 text-[15px] font-medium text-white transition-all hover:bg-[#0077ed]"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">
            Create your account
          </h1>
          <p className="mt-2 text-[15px] text-[#86868b]">
            Join the delivery marketplace
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

          {/* Role selector */}
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">
              I want to...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("shipper")}
                className={`rounded-xl border-2 px-4 py-4 text-center transition-all ${
                  role === "shipper"
                    ? "border-[#0071e3] bg-[#0071e3]/5"
                    : "border-[#e5e5e7] bg-white hover:border-[#c5c5c7]"
                }`}
              >
                <div className="text-2xl">&#128230;</div>
                <div className="mt-1 text-[13px] font-semibold text-[#1d1d1f]">
                  Ship
                </div>
                <div className="mt-0.5 text-[11px] text-[#86868b]">
                  Send packages
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`rounded-xl border-2 px-4 py-4 text-center transition-all ${
                  role === "driver"
                    ? "border-[#0071e3] bg-[#0071e3]/5"
                    : "border-[#e5e5e7] bg-white hover:border-[#c5c5c7]"
                }`}
              >
                <div className="text-2xl">&#128666;</div>
                <div className="mt-1 text-[13px] font-semibold text-[#1d1d1f]">
                  Drive
                </div>
                <div className="mt-0.5 text-[11px] text-[#86868b]">
                  Earn money
                </div>
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]"
            >
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]"
            >
              Phone <span className="font-normal text-[#86868b]">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11 w-full rounded-xl border border-[#e5e5e7] bg-white px-4 text-[15px] text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-[#0071e3] text-[15px] font-medium text-white transition-all hover:bg-[#0077ed] hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          {role === "driver" && (
            <p className="text-center text-[12px] leading-relaxed text-[#86868b]">
              Free trial included. Then $99/month. Keep 100% of earnings.
            </p>
          )}
        </form>

        <div className="mt-8 border-t border-[#e5e5e7] pt-6 text-center text-[13px] text-[#86868b]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#0071e3] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
