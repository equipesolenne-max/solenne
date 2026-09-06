export default function ProductCardSkeleton() {
  return (
    <div className="group animate-pulse">
      <div className="block relative overflow-hidden bg-ivory-warm/70 aspect-[4/5]" />
      <div className="pt-4 text-center space-y-2">
        <div className="h-3.5 bg-line/50 rounded w-2/3 mx-auto" />
        <div className="h-3 bg-line/30 rounded w-1/3 mx-auto" />
        <div className="h-3.5 bg-line/40 rounded w-1/4 mx-auto" />
      </div>
    </div>
  );
}
