/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--primary)",
                "primary-hover": "var(--primary-hover)",
                background: "var(--bg-color)", // mapping to my css var
            },
            borderRadius: {
                lg: "var(--radius-lg)",
                md: "var(--radius-md)",
            }
        },
    },
    plugins: [],
}
