const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Update root dependencies to their latest versions
const updateRootDeps = async () => {
  console.log("Updating root dependencies to latest versions...");

  // Update development dependencies
  execSync(
    "bun add -D @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest eslint-config-prettier@latest @eslint/eslintrc@latest @eslint/js@latest @next/eslint-plugin-next@latest concurrently@latest eslint@latest eslint-config-next@latest eslint-plugin-react@latest eslint-plugin-react-hooks@latest globals@latest husky@latest lint-staged@latest npm-run-all@latest prettier@latest",
    { stdio: "inherit" },
  );

  console.log("Root dependencies updated successfully!");

  // Run bun install to update bun.lock
  console.log("Updating bun.lock...");
  execSync("bun install", { stdio: "inherit" });
};

updateRootDeps().catch(console.error);
