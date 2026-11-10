/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: 'var(--theme-primary, #00897B)',
          dark: 'var(--theme-primary-dark, #005B52)',
          light: 'var(--theme-primary-light, #E0F2F1)',
          accent: 'var(--theme-accent, #E91E63)',
          start: 'var(--theme-gradient-start, #00695C)',
          end: 'var(--theme-gradient-end, #00897B)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
