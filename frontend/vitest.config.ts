import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: [
      "**/__tests__/**/*.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "tests/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
      "build",
      "e2e/**",
      "__e2e__/**",
      "tests-e2e/**",
      "playwright/**",
    ],
  },
  resolve: {
    alias: [
      // App root alias
      { find: "@", replacement: path.resolve(__dirname, ".") },

      // Shared library
      { find: "@games/shared", replacement: path.resolve(__dirname, "../libs/shared/src") },
      {
        find: /^@games\/shared\/(.*)$/,
        replacement: path.resolve(__dirname, "../libs/shared/src") + "/$1",
      },

      // Games packages — import from package root
      {
        find: /^@games\/([^/]+)$/,
        replacement: path.resolve(__dirname, "../games") + "/$1/src",
      },
      // Games packages — deep paths inside src
      {
        find: /^@games\/([^/]+)\/(.*)$/,
        replacement: path.resolve(__dirname, "../games") + "/$1/src/$2",
      },
    ],
  },
});
