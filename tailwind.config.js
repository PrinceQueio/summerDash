/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#0df259",
                "secondary": "#111813",
                "background-light": "#ffffff",
                "background-dark": "#121216",
                "sunny-yellow": "#FFD700",
                "accent-gray": "#f3f4f6",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "body": ["Noto Sans", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "1rem",
                "full": "9999px"
            },
            backgroundImage: {
                'pixel-pattern': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
            },
            boxShadow: {
                'pixel': '4px 4px 0px 0px #111813',
                'pixel-hover': '6px 6px 0px 0px #0df259',
            }
        },
    },
    plugins: [],
}
