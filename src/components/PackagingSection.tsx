import { useEffect, useRef, useState } from "react";
import SectionLabel from "./SectionLabel";

const SolenneIcon = ({ className = "w-9 h-9", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M22 66C22 66 30 74 50 74C70 74 78 66 78 66"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M26 34C40 20 60 20 74 34C78 46 74 58 62 66C50 74 50 74 50 74C50 74 50 74 38 66C26 58 22 46 26 34Z"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PackagingSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Animation lock timers
  const boxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bagTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isBoxBusy, setIsBoxBusy] = useState(false);
  const [isBagBusy, setIsBagBusy] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      if (boxTimer.current) clearTimeout(boxTimer.current);
      if (bagTimer.current) clearTimeout(bagTimer.current);
    };
  }, []);

  const toggleBox = () => {
    if (isBoxBusy) return;
    setHasInteracted(true);
    setIsBoxBusy(true);
    setIsBoxOpen(!isBoxOpen);

    // BOX_TOTAL_MS = 1160 (from reference)
    boxTimer.current = setTimeout(() => {
      setIsBoxBusy(false);
    }, 1160);
  };

  const toggleBag = () => {
    if (isBagBusy) return;
    setHasInteracted(true);
    setIsBagBusy(true);
    setIsBagOpen(!isBagOpen);

    // BAG_TOTAL_MS = 820 (from reference)
    bagTimer.current = setTimeout(() => {
      setIsBagBusy(false);
    }, 820);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`max-w-page mx-auto px-6 md:px-10 py-20 md:py-24 transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="max-w-[560px] mb-14">
        <SectionLabel num="04" title="The Solenne Experience" />
        <h2 className="font-display text-[24px] md:text-[34px] leading-[1.3] tracking-[0.01em] text-midnight">
          A beautiful thing,<br />
          <em className="font-voice italic font-normal text-gold not-italic">from the very beginning.</em>
        </h2>
        <p className="mt-[18px] font-sans text-[14.5px] leading-[1.75] text-midnight/60 max-w-[440px]">
          Every Solenne hijab is folded, wrapped, and presented by hand — a quiet
          ritual before it ever reaches you. Tap the box or the bag to see how it arrives.
        </p>
      </div>

      <div className={`
        bg-[linear-gradient(180deg,#EDE7DA_0%,#E3D9C6_100%)]
        border border-line
        py-[100px] md:py-[130px] px-6 md:px-[50px]
        flex flex-wrap items-end justify-center gap-20 md:gap-[90px]
        relative
      `}>
        {/* Box Interaction */}
        <div className={`flex flex-col items-center transition-all duration-1000 delay-200 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          <div
            role="button"
            tabIndex={0}
            aria-expanded={isBoxOpen}
            aria-label="Open the Solenne box to reveal the silk hijab inside"
            onClick={toggleBox}
            onKeyDown={(e) => handleKeyDown(e, toggleBox)}
            className="group outline-none cursor-pointer rounded-[2px] focus-visible:ring-1 focus-visible:ring-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-gold [perspective:1500px] pt-[60px] px-5 pb-5"
          >
            <div className="relative w-[230px] h-[178px]">
              {/* Interior Glow */}
              <div className={`absolute top-[-4px] left-[14%] right-[14%] h-[60px] z-[1] bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,252,244,0.85)_0%,rgba(255,252,244,0)_70%)] transition-opacity duration-500 delay-200 ${
                isBoxOpen ? "opacity-100" : "opacity-0"
              }`} />

              {/* Lid Shadow */}
              <div className={`absolute top-[-6px] left-[10%] right-[10%] h-[14px] z-[1] bg-[radial-gradient(ellipse_at_center,rgba(16,27,48,0.28)_0%,rgba(16,27,48,0)_75%)] transition-opacity duration-500 delay-150 ${
                isBoxOpen ? "opacity-100" : "opacity-0"
              }`} />

              {/* Tissue Paper */}
              <div className={`absolute top-[-2px] left-[22%] right-[22%] h-[34px] z-[1] bg-[linear-gradient(160deg,#FFFDF8_0%,#F3EDE1_100%)] [clip-path:polygon(0%_55%,18%_20%,40%_45%,58%_12%,78%_40%,100%_18%,100%_100%,0%_100%)] transition-all duration-[550ms] delay-[360ms] ease-out ${
                isBoxOpen ? "opacity-100 translate-y-[-20px]" : "opacity-0 translate-y-[24px]"
              }`} />

              {/* Hijab */}
              <div className={`absolute top-[4px] left-[30%] right-[30%] h-[46px] z-[1] transition-all duration-[600ms] delay-[540ms] ease-out ${
                isBoxOpen ? "opacity-100 translate-y-[-26px] scale-100" : "opacity-0 translate-y-[30px] scale-[0.95]"
              }`}>
                <div className="absolute inset-0 rounded-t-[3px] rounded-b-[10px] bg-[linear-gradient(135deg,#D9C39C_0%,#C6A369_48%,#DCD0BB_100%)] shadow-[0_10px_18px_-10px_rgba(16,27,48,0.3)] before:absolute before:top-[16%] before:bottom-[16%] before:left-[32%] before:w-[1px] before:bg-white/40 after:absolute after:top-[16%] after:bottom-[16%] after:left-[64%] after:w-[1px] after:bg-white/40" />
                <div className="absolute top-[-12px] right-[8%] w-[26px] h-[14px] bg-ivory border border-midnight/15 flex items-center justify-center font-voice italic text-[6px] tracking-[0.06em] text-midnight before:absolute before:top-[-6px] before:left-1/2 before:w-[1px] before:h-[6px] before:bg-midnight/30">
                  SOLENNE
                </div>
              </div>

              {/* Box Base */}
              <div className="absolute inset-0 z-[2] bg-[linear-gradient(160deg,#223357_0%,#101B30_100%)] shadow-[0_30px_45px_-20px_rgba(16,27,48,0.45)] flex flex-col items-center justify-center transition-transform duration-400 group-hover:translate-y-[-4px]">
                <SolenneIcon className="w-[34px] h-[34px] mb-[10px]" color="#F8F4EC" />
                <span className="font-display text-[19px] tracking-[0.14em] text-ivory">SOLENNE</span>
                <span className="font-voice italic text-[10px] tracking-[0.18em] uppercase text-gold-soft mt-1.5">Silk hijab collection</span>
              </div>

              {/* Ribbon */}
              <div className={`absolute left-1/2 top-[-18px] bottom-0 w-[10px] z-[4] translate-x-[-50%] bg-[linear-gradient(180deg,#D9C39C,#C6A369)] opacity-[0.85] transition-opacity duration-[320ms] ${
                isBoxOpen ? "opacity-0" : "group-hover:brightness-[1.12]"
              }`} />

              {/* Lid */}
              <div
                style={{
                  transformOrigin: '50% 100%',
                  transform: isBoxOpen ? 'translateY(-46px) rotateX(-16deg)' : 'translateY(0) rotateX(0deg)'
                }}
                className={`absolute top-[-18px] left-[-4px] right-[-4px] h-[30px] z-[5] bg-[linear-gradient(160deg,#2A3E68_0%,#15223C_100%)] shadow-[0_6px_10px_-4px_rgba(16,27,48,0.4)] transition-all duration-[1000ms] ease-out ${
                  isBoxOpen ? "shadow-[0_26px_30px_-16px_rgba(16,27,48,0.4)]" : ""
                }`}
              />
            </div>
            {/* Box Shadow */}
            <div className="w-[230px] h-[16px] mt-[10px] bg-[radial-gradient(ellipse_at_center,rgba(16,27,48,0.25)_0%,rgba(16,27,48,0)_72%)] transition-all duration-500 group-hover:opacity-[0.85] group-hover:blur-[1px]" />
          </div>
          <span className={`mt-[22px] font-voice italic text-[12.5px] tracking-[0.04em] text-midnight/40 transition-opacity duration-600 pointer-events-none ${
            hasInteracted ? "opacity-0" : "opacity-100"
          }`}>Tap to discover</span>
        </div>

        {/* Bag Interaction */}
        <div className={`flex flex-col items-center transition-all duration-1000 delay-[350ms] ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          <div
            role="button"
            tabIndex={0}
            aria-expanded={isBagOpen}
            aria-label="Open the Solenne shopping bag to see the hijab inside"
            onClick={toggleBag}
            onKeyDown={(e) => handleKeyDown(e, toggleBag)}
            className="group outline-none cursor-pointer rounded-[2px] focus-visible:ring-1 focus-visible:ring-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-gold [perspective:900px] p-4"
          >
            <div className="relative w-[190px] flex flex-col items-center">
              {/* Handles */}
              <div className="relative w-[80px] h-[46px] mb-[-3px] z-[3]">
                <span
                  style={{ transformOrigin: 'bottom center' }}
                  className={`absolute bottom-0 left-0 w-[40px] h-[46px] border-[6px] border-beige border-r-0 border-b-0 rounded-t-[40px] transition-transform duration-[600ms] ease-out ${
                    isBagOpen ? "rotate-[-9deg]" : "group-hover:rotate-[-4deg]"
                  }`}
                />
                <span
                  style={{ transformOrigin: 'bottom center' }}
                  className={`absolute bottom-0 right-0 w-[40px] h-[46px] border-[6px] border-beige border-l-0 border-b-0 rounded-t-[40px] transition-transform duration-[600ms] ease-out ${
                    isBagOpen ? "rotate-[9deg]" : "group-hover:rotate-[4deg]"
                  }`}
                />
              </div>

              <div className={`relative w-[190px] h-[220px] transition-transform duration-[500ms] ease-out ${
                isBagOpen ? "" : "group-hover:translate-y-[-5px]"
              }`}>
                {/* Back Wall */}
                <div className={`absolute top-[-8px] left-[12px] right-[12px] h-[200px] z-0 bg-[linear-gradient(155deg,#E9E0D2_0%,#DCD0BB_100%)] transition-transform duration-500 ${
                  isBagOpen ? "translate-y-[-3px]" : ""
                }`} />

                {/* Hijab */}
                <div className={`absolute top-[-6px] left-[32%] right-[32%] h-[46px] z-[1] transition-all duration-[550ms] delay-[260ms] ease-out ${
                  isBagOpen ? "opacity-100 translate-y-[-10px]" : "opacity-0 translate-y-[30px]"
                }`}>
                  <div className="absolute inset-0 rounded-t-[3px] rounded-b-[8px] bg-[linear-gradient(140deg,#D9C39C_0%,#1B2A46_65%,#101B30_100%)] shadow-[0_8px_14px_-8px_rgba(16,27,48,0.3)] before:absolute before:top-[20%] before:bottom-[20%] before:left-[46%] before:w-[1px] before:bg-white/30" />
                </div>

                {/* Tissue */}
                <div className={`absolute top-[-4px] left-[20%] w-[30%] h-[30px] z-[1] bg-[linear-gradient(160deg,#FFFDF8_0%,#F3EDE1_100%)] [clip-path:polygon(0%_60%,30%_15%,60%_45%,100%_10%,100%_100%,0%_100%)] transition-all duration-[500ms] delay-[180ms] ease-out ${
                  isBagOpen ? "opacity-100 translate-y-[-8px]" : "opacity-0 translate-y-[20px]"
                }`} />

                {/* Front Wall */}
                <div className="absolute inset-0 z-[2] bg-[linear-gradient(155deg,#F8F4EC_0%,#E9E0D2_100%)] shadow-[0_30px_40px_-18px_rgba(16,27,48,0.35)] flex flex-col items-center justify-center before:absolute before:top-0 before:bottom-0 before:left-4 before:w-[1px] before:bg-midnight/5 after:absolute after:top-0 after:bottom-0 after:right-4 after:w-[1px] after:bg-midnight/5">
                  <div className={`absolute top-0 left-0 right-0 h-[30px] bg-[linear-gradient(180deg,rgba(27,42,70,0.16),rgba(27,42,70,0))] transition-opacity duration-500 ${
                    isBagOpen ? "opacity-100" : "opacity-0"
                  }`} />
                  <SolenneIcon className="w-[30px] h-[30px] mb-[10px]" color="#1B2A46" />
                  <span className="font-display text-[16px] tracking-[0.13em] text-midnight">SOLENNE</span>
                </div>
              </div>
            </div>
            {/* Bag Shadow */}
            <div className="w-[190px] h-[16px] mt-[10px] bg-[radial-gradient(ellipse_at_center,rgba(16,27,48,0.22)_0%,rgba(16,27,48,0)_72%)]" />
          </div>
          <span className={`mt-[22px] font-voice italic text-[12.5px] tracking-[0.04em] text-midnight/40 transition-opacity duration-600 pointer-events-none ${
            hasInteracted ? "opacity-0" : "opacity-100"
          }`}>Tap to discover</span>
        </div>
      </div>
    </section>
  );
}
