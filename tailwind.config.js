export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Vazirmatn', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        fa: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        town: '#007bff',
        mafia: '#dc3545',
        thirdParty: '#ffc107',
      },
    },
  },
  plugins: [],
};
