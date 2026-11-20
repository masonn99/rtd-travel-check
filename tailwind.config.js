/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"'],
      },
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        fill: token('fill'),
        line: token('line'),
        ink: { DEFAULT: token('ink'), 2: token('ink-2'), 3: token('ink-3') },
        accent: { DEFAULT: token('accent'), ink: token('accent-ink') },
        status: {
          'free-bg': token('free-bg'), 'free-fg': token('free-fg'),
          'evisa-bg': token('evisa-bg'), 'evisa-fg': token('evisa-fg'),
          'voa-bg': token('voa-bg'), 'voa-fg': token('voa-fg'),
          'req-bg': token('req-bg'), 'req-fg': token('req-fg'),
          'nr-bg': token('nr-bg'), 'nr-fg': token('nr-fg'),
        },
      },
    },
  },
  plugins: [],
}
