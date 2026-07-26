import { defineConfig } from "vitest/config";

// Test runner for the shared ./pricing + ./sales-order engines. The library ships TypeScript source
// only (no build step), so vitest transpiles via esbuild the same way consumers transpile via Next.js.
// Tests live under tests/ (outside src/, so they are never published — package.json files:["src"]).
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
