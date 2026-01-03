/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
      },
    },
  },
  plugins: [],
}
