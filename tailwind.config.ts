import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0F1115",
        surface: "#171A21",
        "surface-raised": "#1F232C",
        gold: "#E8B54A",
        "gold-dim": "#9C7A32",
        velvet: "#B23A48",
        paper: "#F5F1E8",
        muted: "#8B8F9B",
      },
      fontFamily: {
        display: ["var(--font-marquee)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
