export default function SectionLabel({ num, title, dark = false }: { num: string; title: string; dark?: boolean }) {
  return (
    <div className="section-label mb-8">
      <span className={`font-voice italic text-sm ${dark ? "text-gold-soft" : "text-gold"}`}>{num}</span>
      <span
        className={`font-display text-[13px] tracking-[0.1em] uppercase ${dark ? "text-ivory" : "text-midnight"}`}
      >
        {title}
      </span>
      <span className={`rule ${dark ? "!bg-ivory/15" : ""}`}></span>
    </div>
  );
}
