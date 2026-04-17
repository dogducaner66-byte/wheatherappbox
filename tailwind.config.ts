import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', './tests/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 20px 60px rgba(56, 189, 248, 0.22)',
      },
      colors: {
        aurora: {
          500: '#38bdf8',
          600: '#0ea5e9',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

