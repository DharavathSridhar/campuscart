/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#22C55E', 50: '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0', 300: '#86EFAC', 400: '#4ADE80', 500: '#22C55E', 600: '#16A34A', 700: '#15803D', 800: '#166534', 900: '#14532D' },
        accent: { DEFAULT: '#DCFCE7', light: '#F0FDF4' },
        eco: { green: '#22C55E', dark: '#16A34A', light: '#DCFCE7', bg: '#F8FAFC' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: { 'fade-in': 'fadeIn 0.5s ease-in-out', 'slide-up': 'slideUp 0.5s ease-out', 'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', 'bounce-slow': 'bounce 2s infinite', 'counter': 'counter 2s ease-out forwards' },
      keyframes: { fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } }, slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } } },
    },
  },
  plugins: [],
};
