/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F19C40',
        secondary: '#FCF08A'
      },
    },
  },
  plugins: [require("daisyui")],
}

