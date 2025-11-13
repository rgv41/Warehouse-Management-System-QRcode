// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // atau 'media', tapi kita tidak akan pakai class "dark"
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#171717',
      },
    },
  },
  plugins: [],
}