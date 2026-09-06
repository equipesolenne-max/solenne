export default function PagePlaceholder({
  eyebrow,
  title,
  note,
}: {
  eyebrow: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="max-w-page mx-auto px-6 md:px-10 py-28 text-center min-h-[50vh]">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="font-display text-3xl md:text-4xl text-midnight mt-4">{title}</h1>
      {note && (
        <p className="font-voice italic text-lg text-midnight/50 mt-6 max-w-md mx-auto">{note}</p>
      )}
    </div>
  );
}
