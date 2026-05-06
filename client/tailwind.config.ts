import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      backgroundColor: {
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        tertiary: "var(--bg-tertiary)",
        brand: "var(--color-1)",
        "brand-hover": "var(--color-1-hover)",
        danger: "var(--color-danger)",
        success: "var(--color-success)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        brand: "var(--color-1)",
        "brand-hover": "var(--color-1-hover)",
        danger: "var(--color-danger)",
        success: "var(--color-success)",
      },
      borderColor: {
        DEFAULT: "var(--border-color)",
        brand: "var(--color-1)",
        "brand-hover": "var(--color-1-hover)",
        danger: "var(--color-danger)",
        success: "var(--color-success)",
      },
      gradientColorStops: {
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        tertiary: "var(--bg-tertiary)",
        brand: "var(--color-1)",
        "brand-hover": "var(--color-1-hover)",
      },
      colors: {
        // Fallback colors for arbitrary utility classes like ring-*
        brand: "var(--color-1)",
        danger: "var(--color-danger)",
        success: "var(--color-success)",
      },
      borderRadius: {
        box: "var(--border-radius-2)",
        input: "var(--border-radius-1)",
      },
      boxShadow: {
        box: "var(--box-shadow)",
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        ":root": {
          "--bg-primary": "#f4f4f5",
          "--bg-secondary": "#ffffff",
          "--bg-tertiary": "#fafafa",
          "--text-primary": "#09090b",
          "--text-secondary": "#52525b",
          "--color-1": "#4f46e5",
          "--color-1-hover": "#4338ca",
          "--color-2": "#ffffff",
          "--color-accent": "#fbbf24",
          "--color-danger": "#e11d48",
          "--border-color": "#e4e4e7",
          "--color-success": "#10b981",
          "--padding-1": "1.5rem",
          "--padding-2": "3rem",
          "--padding-3": "5rem",
          "--element-padding-1": "0.875rem 1.25rem",
          "--element-padding-2": "1.25rem 1.75rem",
          "--gap-1": "1.25rem",
          "--gap-2": "2.5rem",
          "--border-radius-1": "0.75rem",
          "--border-radius-2": "1.25rem",
          "--border-radius-3": "2rem",
          "--box-shadow":
            "0 1px 3px rgba(0,0,0,0.02), 0 4px 10px -2px rgba(0,0,0,0.04), 0 12px 20px -4px rgba(0,0,0,0.04)",
        },
        "[data-theme='dark']": {
          "--bg-primary": "#09090b",
          "--bg-secondary": "#18181b",
          "--bg-tertiary": "#1f1f22",
          "--text-primary": "#fafafa",
          "--text-secondary": "#a1a1aa",
          "--color-1": "#6366f1",
          "--color-1-hover": "#818cf8",
          "--color-2": "#18181b",
          "--color-accent": "#fcd34d",
          "--color-danger": "#fb7185",
          "--border-color": "#27272a",
          "--color-success": "#34d399",
          "--box-shadow": "0 4px 6px -1px rgba(0,0,0,0.4), 0 10px 25px -5px rgba(0,0,0,0.6)",
        },
        body: {
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          WebkitFontSmoothing: "antialiased",
        },
        "*, ::before, ::after": {
          borderColor: "var(--border-color)",
        },
      });
    }),
  ],
};

export default config;
