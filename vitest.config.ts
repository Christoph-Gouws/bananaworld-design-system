import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Test runner for the shared ./pricing + ./sales-order engines AND the UI primitives. The library
// ships TypeScript source only (no build step), so vitest transpiles via esbuild the same way
// consumers transpile via Next.js. Tests live under tests/ (outside src/, so they are never
// published — package.json files:["src"]).
//
// Component tests run in a DOM environment as their own project, so the pure engines keep running
// in plain node — that stops a DOM global from ever masking a leak into supposedly-pure logic.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "engines",
          include: ["tests/pricing/**/*.test.ts", "tests/sales-order/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        plugins: [react()],
        test: {
          name: "components",
          include: ["tests/components/**/*.test.tsx"],
          environment: "happy-dom",
        },
      },
    ],
  },
});
