/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uam: {
          celeste: '#6dc6d4',
          'celeste-dark': '#4fb3c3',
          'celeste-light': '#8dd4df',
          naranja: '#ee720c',
          verde: '#92bb22',
        },
      },
    },
  },
  plugins: [],
}
