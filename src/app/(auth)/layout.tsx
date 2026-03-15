import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="fixed left-0 right-0 top-0 z-50 bg-[#fafafa]">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]"
          >
            Sprinter Cargo
          </Link>
        </div>
      </nav>
      <div className="pt-14">{children}</div>
    </div>
  );
}
