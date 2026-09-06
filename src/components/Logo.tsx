type LogoProps = {
  variant?: "light" | "dark";
  showMark?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { mark: 22, word: "text-lg tracking-wordmark" },
  md: { mark: 30, word: "text-2xl tracking-wordmark" },
  lg: { mark: 44, word: "text-4xl tracking-wordmark" },
};

export default function Logo({ variant = "light", showMark = true, size = "md" }: LogoProps) {
  const stroke = variant === "light" ? "#1B2A46" : "#F8F4EC";
  const wordColor = variant === "light" ? "text-midnight" : "text-ivory";
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      {showMark && (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: s.mark, height: s.mark }}
        >
          <path
            d="M22 66C22 66 30 74 50 74C70 74 78 66 78 66"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M26 34C40 20 60 20 74 34C78 46 74 58 62 66C50 74 50 74 50 74C50 74 50 74 38 66C26 58 22 46 26 34Z"
            stroke={stroke}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M50 74C50 74 46 54 50 34C54 54 50 74 50 74Z"
            stroke="#C6A369"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span className={`font-display ${s.word} ${wordColor}`}>SOLENNE</span>
    </div>
  );
}
