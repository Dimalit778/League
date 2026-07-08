/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
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
        teko: ['Teko_400Regular'],
        'teko-bold': ['Teko_700Bold'],
      },

      maxWidth: {
        sm: '400px',
        md: '680px',
        lg: '900px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
};
