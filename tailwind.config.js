/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)", surface: "var(--surface)", "surface-2": "var(--surface-2)", ink: "var(--ink)", muted: "var(--muted)",
        line: "var(--line)", track: "var(--track)", accent: "var(--accent)", "accent-soft": "var(--accent-soft)", "accent-ink": "var(--accent-ink)",
        good: "var(--good)", "good-soft": "var(--good-soft)", warn: "var(--warn)", "warn-soft": "var(--warn-soft)", bad: "var(--bad)", "bad-soft": "var(--bad-soft)",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
