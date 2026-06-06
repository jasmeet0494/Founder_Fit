/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0d0d0d',
        'dark-card': '#1a1a2e',
        'cyan-accent': '#00BCD4',
        'purple-accent': '#9333EA',
        'muted-text': '#6b7280',
      },
      fontFamily: {
        'mono': ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
