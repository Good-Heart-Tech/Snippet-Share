/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'cornflower': '#7189ff',
        'charcoal': '#394053',
        'gray': '#808080',
        'uranian': '#a0ddff',
        'rich-black': '#091D20',
        'white': '#FFFFFF',
      },
      fontFamily: {
        'nunito': ['Nunito Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 