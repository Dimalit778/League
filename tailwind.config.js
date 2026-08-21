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
        onPrimary: 'var(--color-on-primary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        subtle: 'var(--color-subtle)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        overlay: 'var(--color-overlay)',
      },
      fontFamily: {
        oswald: ['Oswald_400Regular'],
        'oswald-bold': ['Oswald_700Bold'],
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
