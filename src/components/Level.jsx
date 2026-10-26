import { LEVEL } from "../lib/scoring.js";

export default function Level({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      {label}
      <span className="inline-flex gap-0.5" aria-label={`${label} ${LEVEL[value]}`}>
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-1.5 w-3 rounded-sm ${i <= value ? "bg-accent" : "bg-track"}`} />
        ))}
      </span>
    </span>
  );
}
