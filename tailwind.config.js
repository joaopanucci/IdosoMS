/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5', 
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b'
        },
        warning: {
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706'
        },
        danger: {
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}