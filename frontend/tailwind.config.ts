import type { Config } from "tailwindcss";

// "Crisis Minimalism" design tokens.
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette — NO harsh reds anywhere.
        background: "#F9FAFB", // off-white
        foreground: "#0F172A", // slate-900 for high contrast text
        primary: {
          DEFAULT: "#2563EB", // deep trustworthy blue
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B", // soft amber
          foreground: "#1F2937",
        },
        muted: {
          DEFAULT: "#E5E7EB",
          foreground: "#4B5563",
        },
        border: "#E5E7EB",
        ring: "#2563EB",
        card: {
          DEFAULT: "rgba(255,255,255,0.72)", // glassmorphic
          foreground: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Minimum legible 16px base; generous scale for stressed readers.
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.5rem", { lineHeight: "1.4" }],
        "3xl": ["1.875rem", { lineHeight: "1.3" }],
        "4xl": ["2.25rem", { lineHeight: "1.2" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
      },
      borderRadius: {
        lg: "1.25rem",
        md: "1rem",
        sm: "0.75rem",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 23, 42, 0.08)",
        "glass-lg": "0 12px 48px rgba(15, 23, 42, 0.12)",
      },
      backdropBlur: {
        glass: "16px",
      },
      minHeight: {
        tap: "48px", // massive tap targets
      },
      minWidth: {
        tap: "48px",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
