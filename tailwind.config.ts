import type { Config } from "tailwindcss";

const config: Config = {
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
        primary: {
          DEFAULT: "#1e40af",
          light: "#3b82f6",
          dark: "#1e3a8a",
        },
        secondary: {
          DEFAULT: "#0f172a",
          light: "#1e293b",
        },
        accent: {
          maritime: "#0ea5e9",
          insurgency: "#ef4444",
          airspace: "#f59e0b",
          diplomatic: "#8b5cf6",
        },
        status: {
          confirmed: "#22c55e",
          reported: "#eab308",
          unverified: "#6b7280",
        },
      },
    },
  },
  plugins: [],
};

export default config;
