/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        neon: "rgb(var(--neon-rgb))",
        gold: "rgb(var(--gold-rgb))",
        rust: "rgb(var(--rust-rgb))",
        caution: "rgb(var(--caution-rgb))",
        concrete: "rgb(var(--concrete-rgb))",
      },
      boxShadow: {
        "gold-sm": "0 0 12px rgba(var(--gold-rgb), 0.5)",
        "gold-md": "0 0 20px rgba(var(--gold-rgb), 0.5)",
        "gold-lg": "0 0 28px rgba(var(--gold-rgb), 0.4)",
        "red-glow": "0 0 16px rgba(var(--neon-rgb), 0.4), 0 0 24px rgba(var(--neon-rgb), 0.2)",
        "street-glow": "0 0 20px rgba(var(--rust-rgb), 0.3), 0 0 0 1px rgba(0,0,0,0.3)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

