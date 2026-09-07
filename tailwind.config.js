/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f4f9ea',
          100: '#e8f3d5',
          200: '#d5e8a9',
          300: '#c2dc7e',
          400: '#acd053',
          500: '#95c32d', // Logo color
          600: '#7da526',
          700: '#64841e',
          800: '#4a6216',
          900: '#32410f',
        },
        emerald: {
          50: '#f4f9ea',
          100: '#e8f3d5',
          200: '#d5e8a9',
          300: '#c2dc7e',
          400: '#acd053',
          500: '#95c32d', // Logo color
          600: '#7da526',
          700: '#64841e',
          800: '#4a6216',
          900: '#32410f',
        }
      }
    },
  },
  plugins: [],
}
