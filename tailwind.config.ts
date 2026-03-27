import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  darkMode: "class",
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        flash: {
          "0%,100%": { opacity: 0, transform: "scale(.3)" },
          "10%,30%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        flash: "flash 400ms infinite",
      },
      colors: {
        palladian: "#EEE9DF",
        abyssal: "#1B2632",
        ember: "#FF6B35",
        warmGlow: "#FFB849",
        slate: "#2A3441"
      }
    },
  },
  plugins: [],
};
