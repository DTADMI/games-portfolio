/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#4ade80",
          DEFAULT: "#10B981",
          dark: "#059669",
        },
        secondary: {
          light: "#f87171",
          DEFAULT: "#EF4444",
          dark: "#DC2626",
        },
      },
    },
  },
  plugins: [],
};
