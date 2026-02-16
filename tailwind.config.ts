import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
        'arabic-title': ['"DecoType Thuluth"', 'var(--font-aref-ruqaa)', 'var(--font-amiri)', 'serif'],
      },
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        rosebud: '#F4C2C2',
        blush: '#E8A0BF',
        petal: '#D8BFD8',
        lavender: '#B0E0E6',
        mint: '#C1E1C1',
        forest: '#6B8E23',
        cream: {
          50: '#FDFBF7',
          100: '#FBF7EF',
          200: '#F7EFDF',
          300: '#F0DFBF',
          400: '#E8CF9F',
          500: '#E0BF7F',
          600: '#D8AF5F',
          700: '#C09040',
          800: '#A07030',
          900: '#805020',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
