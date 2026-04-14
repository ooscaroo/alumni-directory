import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0f2040',
          light: '#1a3260',
          muted: '#243b5a',
        },
        cream: {
          DEFAULT: '#f6f0e4',
          dark: '#ede5d3',
          darker: '#dfd5c0',
        },
        gold: {
          DEFAULT: '#c9953c',
          light: '#e0b464',
          muted: '#b8832a',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(15,32,64,0.08), 0 0 0 1px rgba(221,213,194,0.6)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}

export default config
