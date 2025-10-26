/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind v4 uses CSS-first configuration via @theme in index.css
  // This config file is kept minimal for dark mode setup
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
};
