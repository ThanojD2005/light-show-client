/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a',
                surface: '#171717',
                primary: '#3b82f6',
                secondary: '#8b5cf6',
                accent: '#f43f5e',
            },
            animation: {
                'strobe': 'strobe 0.1s infinite',
                'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'glitch': 'glitch 0.15s infinite',
                'rainbow': 'rainbow 3s linear infinite',
                'blink': 'strobe 0.4s infinite',
                'breathe': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                strobe: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
                glitch: {
                    '0%, 100%': { transform: 'translate(0)', filter: 'brightness(1)' },
                    '20%': { transform: 'translate(-2px, 2px)', filter: 'brightness(1.5) hue-rotate(90deg)' },
                    '40%': { transform: 'translate(-2px, -2px)', filter: 'brightness(0.8) contrast(1.2)' },
                    '60%': { transform: 'translate(2px, 2px)', filter: 'brightness(2) saturate(2)' },
                    '80%': { transform: 'translate(2px, -2px)', filter: 'brightness(1.2) hue-rotate(-90deg)' },
                },
                rainbow: {
                    '0%': { filter: 'hue-rotate(0deg)' },
                    '100%': { filter: 'hue-rotate(360deg)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                glow: {
                    '0%': { filter: 'brightness(1) drop-shadow(0 0 10px rgba(255,255,255,0.2))' },
                    '100%': { filter: 'brightness(1.2) drop-shadow(0 0 20px rgba(255,255,255,0.6))' }
                }
            }
        },
    },
    plugins: [],
}
