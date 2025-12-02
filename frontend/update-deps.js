const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Update dependencies to their latest versions
const updateDeps = async () => {
  console.log("Updating dependencies to latest versions...");

  // Update all dependencies to latest versions
  execSync("bun add -D tailwindcss@latest postcss@latest autoprefixer@latest", {
    stdio: "inherit",
  });

  // Update React and Next.js to latest versions
  execSync("bun add react@latest react-dom@latest next@latest", { stdio: "inherit" });

  // Update other key dependencies
  execSync(
    "bun add @radix-ui/react-progress@latest @radix-ui/react-slot@latest @react-three/drei@latest @react-three/fiber@latest @stomp/stompjs@latest axios@latest class-variance-authority@latest clsx@latest firebase@latest firebase-admin@latest lucide-react@latest next-auth@latest next-themes@latest tailwind-merge@latest three@latest",
    { stdio: "inherit" },
  );

  // Update dev dependencies
  execSync(
    "bun add -D @types/node@latest @types/react@latest @types/react-dom@latest @types/three@latest @testing-library/jest-dom@latest @testing-library/react@latest eslint@latest eslint-config-next@latest jsdom@latest typescript@latest @playwright/test@latest vitest@latest",
    { stdio: "inherit" },
  );

  console.log("Dependencies updated successfully!");

  // Run bun install to update bun.lock
  console.log("Updating bun.lock...");
  execSync("bun install", { stdio: "inherit" });
};

updateDeps().catch(console.error);
