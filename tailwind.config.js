/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        youtube: '#ff0000',
        reddit: '#ff4500',
        twitter: '#1da1f2',
        github: '#24292e',
        linkedin: '#2867b2'
      }
    },
  },
  plugins: [],
}