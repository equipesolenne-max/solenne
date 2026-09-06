export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ivory">
      <div className="relative mb-8">
        <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-gold" />
        <div className="absolute inset-0 flex items-center justify-center font-display text-xl text-midnight">
          S
        </div>
      </div>
      <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-midnight/60 animate-pulse">
        Solenne
      </span>
    </div>
  );
}

export function LoadingInline() {
  return (
    <div className="flex w-full items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gold" />
    </div>
  );
}
