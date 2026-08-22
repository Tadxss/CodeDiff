/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0C10',
        inklight: '#12151B',
        inkborder: '#232830',
        bone: '#EDEFF2',
        signal: '#00D9A3',
        muted: '#7C8591',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,217,163,0.4), 0 0 24px rgba(0,217,163,0.25)',
      },
    },
  },
  plugins: [],
}
