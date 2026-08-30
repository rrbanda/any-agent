import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-zinc-100">404</h2>
        <p className="text-zinc-400">This page could not be found.</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-[var(--app-primary)] text-white rounded-md hover:opacity-90 transition-opacity"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
