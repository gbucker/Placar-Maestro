/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8'
        },
        secondary: {
          DEFAULT: '#4b5563',
          hover: '#374151'
        },
        danger: {
          DEFAULT: '#dc2626',
          hover: '#b91c1c'
        },
        warning: {
          DEFAULT: '#f59e42',
          hover: '#fbbf24'
        },
        score: {
          DEFAULT: '#fbbf24',
          track: '#4b5563',
          marker: '#a3e635'
        },
        player: {
          token: '#facc15'
        }
      }
    }
  },
  plugins: [],
}