/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#8AB4F8",
        secondary: "#f9c04a",
        dark: "#1A1A1A",
        surface: "#242424",
        textPrimary: "#F7F7F7",
        textSecondary: "#F7F7F7",
        border: "#333333",
      },
    },
  },
  plugins: [],
};
