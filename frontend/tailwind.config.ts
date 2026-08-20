import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        rh: {
          primary: "#8B5CF6",
          "primary-light": "#A78BFA",
          "primary-dark": "#7C3AED",
          accent: "#C084FC",
          bg: {
            primary: "#0A0A0F",
            secondary: "#12121A",
            tertiary: "#1A1A25",
          },
          text: {
            primary: "#F1F5F9",
            secondary: "#94A3B8",
            muted: "#64748B",
          },
        },
      },
      boxShadow: {
        glossy:
          "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        beveled:
          "inset 0 2px 4px rgba(255, 255, 255, 0.08), inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.4)",
        "glossy-btn":
          "inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.2), 0 4px 12px rgba(139, 92, 246, 0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
