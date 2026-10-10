/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F4D36',
        secondary: '#EFE8DB',

        // Warm paper background + ink text
        cream: {
          50: '#FCFAF6',
          100: '#F7F3EC',
          200: '#EFE8DB',
          300: '#E2D8C6',
        },
        ink: {
          DEFAULT: '#1D2B22',
          soft: '#46534A',
          muted: '#7A837C',
        },
        line: '#E7E0D3',

        // Brand: deep forest green, marigold accent, tomato for alerts
        forest: {
          50: '#EEF4EF',
          100: '#DDE9E0',
          200: '#B9D3BF',
          300: '#8DB59A',
          500: '#2E6B4A',
          600: '#245A3D',
          700: '#1F4D36',
          800: '#173B29',
          900: '#10291D',
        },
        marigold: {
          50: '#FEF8EC',
          100: '#FCEFD3',
          200: '#F9DFA6',
          300: '#F7CF7A',
          400: '#F2B33D',
          500: '#E19A1F',
          600: '#B97A12',
          700: '#8A5A0C',
        },
        tomato: {
          50: '#FCEDE8',
          100: '#F9DCD3',
          400: '#E4785F',
          500: '#D9573B',
          600: '#BF4329',
          700: '#9A3420',
        },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"DM Sans Variable"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(29, 43, 34, 0.04), 0 4px 16px -4px rgba(29, 43, 34, 0.08)',
        lift: '0 2px 4px rgba(29, 43, 34, 0.04), 0 12px 32px -8px rgba(29, 43, 34, 0.16)',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 280ms cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 200ms ease-out',
        'rise-in': 'rise-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'spin-slow': 'spin-slow 24s linear infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
