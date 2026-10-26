import { TONE } from "../lib/scoring.js";

export default function Pill({ tone, children }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[tone].soft} ${TONE[tone].text}`}>{children}</span>;
}
