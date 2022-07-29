/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        'main': '#F8F8F8',
        'secondary': '#F0F0F0'
      },
      margin: {
        'menu': '300px'
      },
      padding: {
        'main-lr': '3.5rem',
        'main-tb': '2.5rem'
      },
      width: {
        'main-lr': '3.5rem',
      },
      backgroundImage: {
        'check': 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3e%3cpath fill=\'%23fff\' d=\'M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z\' /%3e%3c/svg%3e")'
      }
    },
    fontFamily: {
      'sans': ['Archivo', 'sans-serif']
    }
  },
  plugins: [],
  separator: '_',
};
