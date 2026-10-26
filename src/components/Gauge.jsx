import { TONE, band } from "../lib/scoring.js";

export default function Gauge({ score, size = 168 }) {
  const r = 64;
  const c = 2 * Math.PI * r;
  const tone = TONE[band(score).tone];
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label={`Punteggio ${score} su 100`}>
      <circle cx="80" cy="80" r={r} fill="none" stroke="var(--track)" strokeWidth="12" />
      <circle
        cx="80" cy="80" r={r} fill="none" stroke={tone.stroke} strokeWidth="12" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 80 80)"
        style={{ transition: "stroke-dashoffset .8s ease" }}
      />
      <text x="80" y="82" textAnchor="middle" dominantBaseline="middle" fill="var(--ink)"
        style={{ font: "700 44px var(--font-display)", fontVariantNumeric: "tabular-nums" }}>{score}</text>
      <text x="80" y="112" textAnchor="middle" fill="var(--muted)" style={{ font: "500 11px var(--font-mono)" }}>/ 100</text>
    </svg>
  );
}
