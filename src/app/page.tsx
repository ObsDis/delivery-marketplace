import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Nav */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
            Sprinter Cargo
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full px-4 py-1.5 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-black/5"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#1d1d1f] px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#333]"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#0071e3]">
            Last mile delivery, reimagined
          </p>
          <h1 className="text-balance text-5xl font-bold leading-[1.08] tracking-tight text-[#1d1d1f] sm:text-7xl">
            Ship anything.
            <br />
            <span className="bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">
              Earn everything.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-[#86868b] sm:text-xl">
            The delivery marketplace where drivers pay one flat fee and keep
            100% of what they earn. No commission. No surprises.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-full bg-[#0071e3] px-8 text-[15px] font-medium text-white transition-all hover:bg-[#0077ed] hover:shadow-lg hover:shadow-blue-500/25"
            >
              Start delivering
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-full px-8 text-[15px] font-medium text-[#0071e3] transition-colors hover:bg-[#0071e3]/5"
            >
              Ship a package &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-black/5 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#1d1d1f] sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-[17px] leading-relaxed text-[#86868b]">
            Three simple steps. No hidden fees, no complicated setup.
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Post your delivery",
                desc: "Describe your package, set pickup and dropoff locations, and name your budget.",
                icon: "&#128230;",
              },
              {
                step: "02",
                title: "Get competitive bids",
                desc: "Drivers in your area bid on the job. Compare prices, ratings, and availability.",
                icon: "&#128176;",
              },
              {
                step: "03",
                title: "Track and receive",
                desc: "Follow your delivery in real-time. Pay only when it arrives safely.",
                icon: "&#9989;",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group rounded-2xl border border-black/5 bg-[#fafafa] p-8 transition-all hover:border-black/10 hover:shadow-lg hover:shadow-black/5"
              >
                <div className="mb-6 text-4xl" dangerouslySetInnerHTML={{ __html: item.icon }} />
                <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
                  Step {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#1d1d1f]">
                  {item.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-[#86868b]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver CTA */}
      <section className="border-t border-black/5 bg-[#1d1d1f] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#0071e3]">
              For drivers
            </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
              $99/month. Keep&nbsp;every&nbsp;dollar&nbsp;you&nbsp;earn.
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-[#86868b]">
              No per-delivery commission. No surge pricing cuts. Just a simple
              subscription and complete freedom to earn on your terms.
            </p>
            <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center rounded-full bg-white px-8 text-[15px] font-semibold text-[#1d1d1f] transition-all hover:bg-gray-100"
              >
                Start your free trial
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                { value: "100%", label: "of delivery earnings kept" },
                { value: "$0", label: "commission per delivery" },
                { value: "24hr", label: "payout to your account" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-[#86868b]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-[#fafafa] py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="text-[13px] text-[#86868b]">
              &copy; 2026 Sprinter Cargo. All rights reserved.
            </span>
            <div className="flex gap-6 text-[13px] text-[#86868b]">
              <Link href="/login" className="hover:text-[#1d1d1f]">
                Sign in
              </Link>
              <Link href="/signup" className="hover:text-[#1d1d1f]">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
