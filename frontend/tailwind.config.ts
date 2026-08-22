import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#effcfc",
          100: "#d7f6f6",
          200: "#b4ecec",
          300: "#7fddde",
          400: "#4dc7ca",
          500: "#2eaab0",
          600: "#278a93",
          700: "#257078",
          800: "#265b63",
          900: "#1a4d54",
          950: "#0d3238",
        },
        gold: {
          50: "#fdf9ed",
          100: "#f9eed0",
          200: "#f3db9e",
          300: "#ecc46b",
          400: "#e6ad42",
          500: "#d4943a",
          600: "#b0712d",
          700: "#8f5428",
          800: "#774326",
          900: "#643823",
          950: "#3a1c10",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
