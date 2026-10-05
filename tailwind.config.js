/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/views/**/*.ejs',
    './public/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F5C200',
          gold:   '#D4A800',
          black:  '#0a0a0a',
          dark:   '#111111',
          card:   '#1a1a1a',
          gray:   '#2a2a2a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
