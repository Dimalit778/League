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
        nunito: ['Nunito_400Regular'],
        'nunito-bold': ['Nunito_700Bold'],
        'nunito-black': ['Nunito_900Black'],
        teko: ['Teko-Regular'],
        'teko-bold': ['Teko-Bold'],
      },
      fontSize: {
        h1: 'var(--font-size-h1)',
      },
    },
  },
  plugins: [],
};
