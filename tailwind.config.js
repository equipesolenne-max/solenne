/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#1B2A46",
        "midnight-deep": "#101B30",
        ivory: "#F8F4EC",
        "ivory-warm": "#F3EDE1",
        beige: "#DCD0BB",
        "beige-soft": "#E9E0D2",
        gold: "#C6A369",
        "gold-soft": "#D9C39C",
        line: "rgba(27,42,70,0.14)",
      },
      fontFamily: {
        display: ["Marcellus", "serif"],
        voice: ["Cormorant Garamond", "serif"],
        sans: ["Jost", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.35em",
        wordmark: "0.14em",
      },
      maxWidth: {
        page: "1180px",
      },
    },
  },
  plugins: [],
};
