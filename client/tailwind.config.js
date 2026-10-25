/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        detective: {
          dark: '#0a0d14',
          panel: '#121722',
          card: '#1a202c',
          border: '#2d3748',
          accent: '#d97706', // warm amber
          crimson: '#dc2626',
          gold: '#f59e0b'
        }
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace'],
        serif: ['Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
