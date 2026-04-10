/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        duo: {
          green: '#58CC02',
          'green-dark': '#46A302',
          blue: '#1CB0F6',
          'blue-dark': '#1899D6',
          yellow: '#FFC800',
          'yellow-dark': '#E5B400',
          red: '#FF4B4B',
          'red-dark': '#D33131',
          gray: '#E5E5E5',
          'gray-dark': '#AFAFAF',
          text: '#4B4B4B',
          background: '#FFFFFF',
          'background-soft': '#F7F7F7',
        },
      },
      fontFamily: {
        din: ['"Nunito"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
