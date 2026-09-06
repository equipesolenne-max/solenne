export default function CollectionCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-[3/4] bg-ivory-warm/70" />
      <div className="h-4 bg-line/50 rounded w-1/2 mt-5" />
      <div className="h-3 bg-line/30 rounded w-3/4 mt-2" />
    </div>
  );
}
