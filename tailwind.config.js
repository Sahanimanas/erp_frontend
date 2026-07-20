export default {
  darkMode: ["class"],
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter","system-ui","sans-serif"],
        // Marketing-site type pairing (see .gsm-site in index.css).
        display: ["Outfit","Manrope","sans-serif"],
        body: ["Manrope","Inter","sans-serif"],
      },
      // Design tokens for the ported marketing site. These are plain HSL
      // channel vars defined on `.gsm-site` (index.css) — the ERP app never
      // sets them, so none of these colours resolve outside the site and the
      // dashboard's existing slate/emerald palette is untouched.
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card:        { DEFAULT: "hsl(var(--card))",        foreground: "hsl(var(--card-foreground))" },
        popover:     { DEFAULT: "hsl(var(--popover))",     foreground: "hsl(var(--popover-foreground))" },
        primary:     { DEFAULT: "hsl(var(--primary))",     foreground: "hsl(var(--primary-foreground))" },
        secondary:   { DEFAULT: "hsl(var(--secondary))",   foreground: "hsl(var(--secondary-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))",       foreground: "hsl(var(--muted-foreground))" },
        accent:      { DEFAULT: "hsl(var(--accent))",      foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
      },
      animation: { "fade-in": "fadeIn 0.3s ease-in-out" },
      keyframes: { fadeIn: { "0%":{ opacity:"0" }, "100%":{ opacity:"1" } } }
    }
  },
  plugins: []
};
