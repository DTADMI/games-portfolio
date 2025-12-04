/* eslint-env node */
import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Next.js configuration (scoped to frontend package)
const nextConfig = {
  rootDir: path.join(__dirname, "frontend"),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  experimental: {
    appDir: true,
  },
};

// Common TypeScript parser options
const tsParserOptions = {
  project: "./tsconfig.json",
  tsconfigRootDir: __dirname,
  ecmaFeatures: {
    jsx: true,
  },
  ecmaVersion: "latest",
  sourceType: "module",
};

export default [
  // Base recommended config
  js.configs.recommended,

  // TypeScript configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: tsParserOptions,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // TypeScript handles undefined identifiers; avoid duplicate/noise
      "no-undef": "off",
      // Let Prettier handle quote style; allow both
      quotes: "off",
      // Keep codebase strict but report as warnings while we clean up
      semi: ["warn", "always"],
      curly: ["warn", "all"],
      "no-empty": ["warn", {allowEmptyCatch: true}],
      // Defer unused checks to TS plugin and allow leading underscore
      "no-unused-vars": "off",
      // Temporarily disable TS unused-vars rule to avoid cross-config plugin resolution issues
      // when linting from nested workspaces on Windows. We can re-enable after the
      // workspace ESLint runner is stabilized.
      "@typescript-eslint/no-unused-vars": "off",
      // Guardrails: prevent deep imports into games/* and libs/shared/src
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@games/*/src/**",
                "../../games/*/src/**",
                "../games/*/src/**",
                "games/*/src/**",
              ],
              message:
                "Do not deep-import from games/*/src in the frontend. Import from the package root, e.g. `@games/<name>`.",
            },
            {
              group: [
                "@games/shared/src/**",
                "../../libs/shared/src/**",
                "../libs/shared/src/**",
                "libs/shared/src/**",
              ],
              message:
                "Do not import directly from libs/shared/src. Use `@games/shared` public API instead.",
            },
          ],
        },
      ],
    },
  },

  // Next.js config (apply only to the frontend workspace)
  {
    files: ["frontend/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    settings: {
      next: {
        rootDir: nextConfig.rootDir,
      },
      react: {
        version: "detect",
      },
    },
    rules: {
      // Next.js specific rules
      ...nextPlugin.configs.recommended.rules,

      // React specific rules
      "react/react-in-jsx-scope": "off", // Not needed with Next.js
      "react/prop-types": "off", // Not needed with TypeScript

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Custom rules
      semi: ["warn", "always"],
      curly: ["warn", "all"],
      "no-empty": ["warn", {allowEmptyCatch: true}],
      // Allow both single and double quotes (project prefers Prettier to format)
      quotes: "off",
      // Defer unused checks to TS/TSConfig; avoid rule here to prevent plugin resolution issues
      "no-unused-vars": "off",
    },
  },

  // Ignore specific directories
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.idea/**",
      "**/.vscode/**",
      "**/*.sublime-*",
      "**/public/**",
      "**/target/**",
      "**/cypress/**",
      "**/tests-e2e/**",
      "**/__tests__/**",
      "**/*.test.*",
      "**/*.spec.*",
      "**/*.config.*",
      "**/tailwind.config.js",
      "**/vitest.config.ts",
      "**/playwright.config.ts",
      "**/backend/doc/**", // Exclude backend docs from ESLint
      "**/backend/target/**",
      "**/doc/**",
      "types/**/*.d.ts",
      "**/generated/**",
      ".eslintcache",
      ".env*",
      "**/.eslintrc.*",
    ],
  },

  // React configuration (applies project-wide)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        ...tsParserOptions,
      },
    },
    rules: {
      // React rules
      "react/react-in-jsx-scope": "off", // Not needed with Next.js
      "react/prop-types": "off", // Not needed with TypeScript

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Custom rules
      semi: ["warn", "always"],
      curly: ["warn", "all"],
      "no-empty": ["warn", {allowEmptyCatch: true}],
      // Allow both single and double quotes globally
      quotes: "off",
      // TypeScript already checks undefined symbols
      "no-undef": "off",
      // Defer unused checks to TS/TSConfig; avoid rule here to prevent plugin resolution issues
      "no-unused-vars": "off",
    },
  },
];
