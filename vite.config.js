import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relativo: il build funziona sia su GitHub Pages (/radar-visibilita/) sia in locale.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
