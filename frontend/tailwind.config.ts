import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f0ff",
          100: "#e0dfff",
          200: "#c7c4ff",
          300: "#a5a0ff",
          400: "#8478ff",
          500: "#6c55fa",
          600: "#5e35f0",
          700: "#5027dc",
          800: "#4220b8",
          900: "#381d96",
          950: "#1f0f5c",
        },
        surface: {
          0: "#09090b",
          50: "#0f0f14",
          100: "#15151c",
          200: "#1c1c26",
          300: "#25252f",
          400: "#32323e",
          500: "#4a4a58",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
