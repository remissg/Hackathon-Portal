/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B132B',
          card: '#1C2541',
          accent: '#0284C7',
          cyan: '#38BDF8',
          light: '#F8FAFC',
        },
      },
    },
  },
  plugins: [],
}
