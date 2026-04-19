import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // `server-only` is a Next.js marker that only works inside Next's
      // bundler; vitest runs files directly. Stub it to an empty module.
      "server-only": path.resolve(__dirname, "./src/__tests__/server-only-stub.ts"),
    },
  },
});
