const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(spinner|table|checkbox|form|spacer).js"
],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'muted-foreground': 'var(--muted-foreground)',
        input: 'var(--input)',
        border: 'var(--border)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        'accent-foreground': 'var(--accent-foreground)'
      }
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};