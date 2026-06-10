/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        a2a: {
          blue: '#1B6CA8',
          'blue-dark': '#154f7c',
          'blue-light': '#e8f0f8',
          green: '#27AE60',
          'green-light': '#e8f7ee',
          grey: '#555555',
          'grey-light': '#777777',
          'grey-bg': '#f5f6f7',
          orange: '#E67E22',
          red: '#E74C3C',
        }
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
