/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eff6ff', 500: '#1A56DB', 900: '#1E429F' }
      }
    },
  },
  plugins: [],
}
