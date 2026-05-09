import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:    '#0b0d0c',
        panel: '#15181a',
        line:  '#22272a',
        ink:   '#e9efe9',
        muted: '#8a948b',
        accent:'#46d369',
        live:  '#ff3a52',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
