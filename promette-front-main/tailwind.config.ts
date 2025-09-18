import type { Config } from 'tailwindcss'

export default {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  theme: {
    extend: {
      colors: {
        'uset': {
          primary: '#572574',
          'primary-hover': '#6a2f8d',
          'primary-active': '#4a1f63',
          secondary: '#A11A5C',
          tertiary: '#76BC21',
        }
      }
    },
  },
  plugins: [],
} satisfies Config
