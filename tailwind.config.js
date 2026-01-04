/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rust: {
          '50': '#fff8ec',
          '100': '#ffefd3',
          '200': '#ffc470',
          '300': '#ffa940',
          '400': '#ff8000',
          '500': '#e66000',
          '600': '#cc4402',
          '700': '#b33800',
          '800': '#ac390b',
          '900': '#822e0c',
          '950': '#461404',
        },
        // Semantic color tokens using CSS variables
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-light': 'var(--color-primary-light)',
        'primary-border': 'var(--color-primary-border)',
        
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-muted': 'var(--color-text-muted)',
        
        'surface-primary': 'var(--color-surface-primary)',
        'surface-secondary': 'var(--color-surface-secondary)',
        'surface-hover': 'var(--color-surface-hover)',
        
        'border-default': 'var(--color-border-default)',
        'border-strong': 'var(--color-border-strong)',
        'border-active': 'var(--color-border-active)',
        
        'error': 'var(--color-error)',
        'error-bg': 'var(--color-error-bg)',
        'error-border': 'var(--color-error-border)',
        'success': 'var(--color-success)',
        'info': 'var(--color-info)',
        
        'disabled': 'var(--color-disabled)',
        'disabled-text': 'var(--color-disabled-text)',
        
        'link': 'var(--color-link)',
        'link-hover': 'var(--color-link-hover)',
        
        'chart-grid': 'var(--color-chart-grid)',
        'chart-axis': 'var(--color-chart-axis)',
        'chart-text': 'var(--color-chart-text)',
        'chart-zero': 'var(--color-chart-zero)',
        'chart-accent': 'var(--color-chart-accent)',
      },
    },
  },
  plugins: [],
}
