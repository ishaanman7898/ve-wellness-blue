import { CSSProperties, useMemo } from "react";

interface WaveMarqueeProps {
  speedSeconds?: number;
  amplitudePx?: number;
  tightnessSeconds?: number;
  repeats?: number;
  className?: string;
}

const TEXT_SEQUENCE = [
  "SUSTAINABLE",
  "SIMPLE",
  "ELEGANT",
  "BEAUTIFUL",
  "INNOVATIVE",
];

export function WaveMarquee({
  speedSeconds = 25,
  amplitudePx = 15,
  tightnessSeconds = -0.05,
  repeats = 4,
  className = "",
}: WaveMarqueeProps) {
  const styleVars = useMemo(() => ({
    "--scroll-speed": `${speedSeconds}s`,
    "--amplitude": `${amplitudePx}px`,
    "--tightness": `${tightnessSeconds}s`,
  }) as CSSProperties, [speedSeconds, amplitudePx, tightnessSeconds]);

  let charIndex = 0;
  const blocks = [] as JSX.Element[];

  for (let r = 0; r < repeats; r++) {
    TEXT_SEQUENCE.forEach((word) => {
      // letters
      for (let i = 0; i < word.length; i++) {
        blocks.push(
          <span
            key={`${r}-${word}-${i}-${charIndex}`}
            className="wave-char font-display text-white text-2xl md:text-3xl font-extrabold"
            style={{ ["--i" as any]: charIndex } as CSSProperties}
          >
            {word[i]}
          </span>
        );
        charIndex++;
      }
      // space
      blocks.push(
        <span key={`${r}-${word}-space-a-${charIndex}`} className="wave-space" style={{ ["--i" as any]: charIndex } as CSSProperties}>&nbsp;</span>
      );
      charIndex++;
      // wave divider
      blocks.push(
        <span
          key={`${r}-${word}-divider-${charIndex}`}
          className="wave-char divider text-glacier text-2xl md:text-3xl font-extrabold"
          style={{ ["--i" as any]: charIndex } as CSSProperties}
        >
          〰
        </span>
      );
      charIndex++;
      // space
      blocks.push(
        <span key={`${r}-${word}-space-b-${charIndex}`} className="wave-space" style={{ ["--i" as any]: charIndex } as CSSProperties}>&nbsp;</span>
      );
      charIndex++;
    });
  }

  return (
    <div className={`wave-container ${className}`} style={styleVars}>
      <style>{`
        .wave-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 0;
          margin: 0;
        }
        .wave-track {
          display: inline-flex;
          white-space: nowrap;
          will-change: transform;
          animation: wave-scroll var(--scroll-speed) linear infinite;
        }
        .wave-char {
          display: inline-block;
          animation: wave-float 2s ease-in-out infinite;
          animation-delay: calc(var(--i) * var(--tightness));
        }
        .wave-space {
          display: inline-block;
          width: 0.75rem;
          animation: wave-float 2s ease-in-out infinite;
          animation-delay: calc(var(--i) * var(--tightness));
        }
        @keyframes wave-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes wave-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(calc(var(--amplitude) * -1)); }
        }
      `}</style>
      <div className="wave-track">
        {blocks}
        {blocks}
      </div>
    </div>
  );
}

export default WaveMarquee;
