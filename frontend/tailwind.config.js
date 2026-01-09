/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A", // Slate 900
        secondary: "#334155", // Slate 700
        accent: "#0EA5E9", // Sky 500
        success: "#22C55E", // Green 500
        warning: "#EAB308", // Yellow 500
        danger: "#EF4444", // Red 500
      },
    },
  },
  plugins: [],
};
