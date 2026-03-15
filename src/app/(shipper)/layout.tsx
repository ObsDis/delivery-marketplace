export default function ShipperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold">Sprinter Cargo — Shipper</span>
      </nav>
      <main>{children}</main>
    </div>
  );
}
