"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/auth/callback` }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
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
            We sent a password reset link to{" "}
            <span className="font-medium text-[#1d1d1f]">{email}</span>.
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
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">
            Reset password
          </h1>
          <p className="mt-2 text-[15px] text-[#86868b]">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-[#0071e3] text-[15px] font-medium text-white transition-all hover:bg-[#0077ed] hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-8 border-t border-[#e5e5e7] pt-6 text-center text-[13px] text-[#86868b]">
          Remember your password?{" "}
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
