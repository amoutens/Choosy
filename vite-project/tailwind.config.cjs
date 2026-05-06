module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
  ],
  theme: {
    extend: {
      fontFamily: {
        abril: ["'Abril Fatface'", 'cursive'],
      },
      colors: {
        choosyPurple: '#7c4dff',
        choosyPurpleDark: '#5b2be6'
      }
    },
  },
  plugins: [],
}
