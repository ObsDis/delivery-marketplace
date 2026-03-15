import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        Sprinter Cargo
      </h1>
      <p className="mb-8 max-w-md text-center text-lg text-gray-600">
        Flat-fee delivery marketplace. Drivers pay $99/month and keep 100% of
        earnings. Shippers post deliveries, drivers bid on them.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
