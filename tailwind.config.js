/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#4A0D67',   // Your Deep Purple
        'brand-secondary': '#7B288D', // Lighter Purple
        'brand-accent': '#F4D35E',    // Warm Yellow
        'brand-dark': '#1E1E24',
        'brand-text': '#333333',
        'brand-light': '#F8F4F9',
      },
    },
  },
  plugins: [],
}