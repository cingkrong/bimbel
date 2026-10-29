import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        canvas: {
          light: "#FFFFFF",
          dark: "#080B14",
        },
        surface: {
          light: "#F8FAFC",
          dark: "#0F172A",
          elevated: "#1E293B",
        },
        brand: {
          navy: "#0F172A",
          rose: "#E11D48",
          orange: "#F97316",
          dark: "#080B14",
        },
        cbt: {
          correct: "#10B981",
          wrong: "#EF4444",
          doubt: "#F59E0B",
          unanswered: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
