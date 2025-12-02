/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

// Add any additional type declarations here if needed
declare module "*.css" {
  const content: string;
  export default content;
}
