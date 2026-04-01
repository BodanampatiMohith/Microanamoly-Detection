import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const buildOutDir = process.env.VITE_BUILD_OUT_DIR || "../backend/static";

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
    emptyOutDir: false,
  },
});
