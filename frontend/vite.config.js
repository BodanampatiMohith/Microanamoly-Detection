import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Default to `dist` for hosting providers like Vercel.
// Docker/unified backend builds can still override this via VITE_BUILD_OUT_DIR.
const buildOutDir = process.env.VITE_BUILD_OUT_DIR || "dist";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: buildOutDir,
    emptyOutDir: true,
  },
});
