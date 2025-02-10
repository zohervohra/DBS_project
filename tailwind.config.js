// tailwind.config.js
module.exports = {
    content: [
      './src/**/*.{html,js,jsx,ts,tsx}', // Adjust the paths to match your project structure
    ],
    theme: {
      extend: {
        colors: {
         
          'primary': '#4A00FF',
          'primary-content' : '#D1DBFF' ,
          'secondary': '#FF00D3',
          'accent' : '#00D7C0'
        },
        fontFamily: {
          sans: ['Graphik', 'sans-serif'],
          serif: ['Merriweather', 'serif'],
        },
        spacing: {
          '128': '32rem',
          '144': '36rem',
        },
        borderRadius: {
          '4xl': '2rem',
        }
      },
    },
    plugins: [],
  }