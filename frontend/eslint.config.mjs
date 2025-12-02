// Re-export the monorepo root flat config. The root config already
// registers the TypeScript plugin and rules; duplicating them here can
// cause "Cannot redefine plugin" errors when ESLint merges configs.
import rootConfig from "../eslint.config.mjs";

// Re-export root config and add a local override that re-enables
// the TS unused-vars rule only for the frontend workspace without
// redefining plugins (plugin is already registered by the root).
export default [
  ...rootConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
