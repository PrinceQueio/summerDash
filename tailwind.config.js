/** @type {import('tailwindcss').Config} */
// NOTE: In Tailwind v4 the theme is defined in App.css via @theme {}.
// This file is kept only for the content scanner.
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
}
