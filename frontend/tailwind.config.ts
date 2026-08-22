import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        stellar: {
          blue: "#3E1BDB",
          purple: "#7B61FF",
          dark: "#0D0B21",
          card: "#1A1730",
          border: "#2D2B42",
        },
      },
    },
  },
  plugins: [],
};

export default config;
