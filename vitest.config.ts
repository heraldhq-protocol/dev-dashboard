import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./__tests__/setup.ts",
    // Make sure we include all standard folders, ignore output
    exclude: ["node_modules", ".next"],
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
