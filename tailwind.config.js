/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        carbon: '#080808',
        onyx: '#111111',
        gold: '#D4AF37',
        champagne: '#F7E7B4',
        white: '#FFFFFF',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 32px rgba(212, 175, 55, 0.22)',
      },
    },
  },
  plugins: [],
};
