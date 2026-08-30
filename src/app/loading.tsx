export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-[var(--app-primary)] rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
