import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

// Light and dark share one set of class names. The slate, emerald, rose and sky scales are CSS variables: the values
// below are Tailwind's own in light, and in dark each scale is turned around (50 becomes the deep tint, 900 the near
// white) so existing classes such as bg-slate-50 or text-slate-900 read correctly in both themes without a dark:
// variant on every element. The dark neutrals are the warm greys the Patient 360 portal uses (globals.css there).
//
// Two things do NOT flip, on purpose: "night" (a dark panel in both themes: banner, floating buttons) and the
// colours of the hospital gradient, which carries white text.
const dark = {
  slate: { 50: '#262624', 100: '#3A3936', 200: '#3E3D39', 300: '#55534D', 400: '#9C998F', 500: '#ABA89F', 600: '#C2BFB5', 700: '#D6D4CB', 800: '#E8E6DE', 900: '#F5F4EF', 950: '#FAF9F5' },
  emerald: { 50: '#1F2D24', 100: '#25382B', 200: '#2F5A41', 300: '#3C7A57', 400: '#34D399', 500: '#10B981', 600: '#5FD39A', 700: '#7FD1A0', 800: '#A3E2BB', 900: '#C9F0D8', 950: '#E4F8EC' },
  rose: { 50: '#3A2220', 100: '#482A27', 200: '#6B3733', 300: '#8E4A44', 400: '#FB7185', 500: '#F43F5E', 600: '#FB7185', 700: '#FDA4AF', 800: '#FECDD3', 900: '#FFE4E6', 950: '#FFF1F2' },
  sky: { 50: '#1E2B35', 100: '#243545', 200: '#2F4B63', 300: '#3F6A8C', 400: '#38BDF8', 500: '#0EA5E9', 600: '#38BDF8', 700: '#7DD3FC', 800: '#BAE6FD', 900: '#E0F2FE', 950: '#F0F9FF' },
};
const SCALES = Object.keys(dark);
const SHADES = Object.keys(dark.slate);

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');
const scaleColors = (name) => Object.fromEntries(SHADES.map((s) => [s, `rgb(var(--${name}-${s}) / <alpha-value>)`]));
const vars = (palette) => Object.fromEntries(SCALES.flatMap((n) => SHADES.map((s) => [`--${n}-${s}`, channels(palette[n][s])])));

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // The theme is a data-theme attribute on <html> (System follows the device and is resolved in src/utils/theme.ts).
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ...Object.fromEntries(SCALES.map((n) => [n, scaleColors(n)])),
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        night: { DEFAULT: '#0F172A', soft: '#1E293B' },
        theme: {
          primary: 'var(--theme-primary)',
          dark: 'var(--theme-dark)',
          light: 'var(--theme-light)',
          accent: 'var(--theme-accent)',
          start: 'var(--theme-gradient-start)',
          end: 'var(--theme-gradient-end)',
          on: 'var(--theme-on-primary)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root': { ...vars(colors), '--canvas': channels('#F4F7FA'), '--surface': channels('#FFFFFF') },
        '[data-theme="dark"]': { ...vars(dark), '--canvas': channels('#262624'), '--surface': channels('#30302E') },
      });
    }),
  ],
};
