/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This ensures TypeScript (.ts, .tsx) files are scanned
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}