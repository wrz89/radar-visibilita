import { priorityOf } from "../lib/scoring.js";

const CLS = {
  bad: "bg-bad-soft text-bad",
  warn: "bg-warn-soft text-warn",
  low: "bg-surface-2 text-muted",
};

export default function Priority({ k }) {
  const p = priorityOf(k);
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${CLS[p.tone]}`}>{p.label}</span>;
}
