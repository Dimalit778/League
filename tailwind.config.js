/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
      },
      fontFamily: {
        headBold: 'var(--font-headline-bold)',
        headLight: 'var(--font-headline-light) ',
      },
      fontSize: {
        h1: 'var(--font-size-h1)',
      },
    },
  },
  plugins: [],
};
