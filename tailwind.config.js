/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff006e',
          cyan: '#00f5ff',
          yellow: '#ffbe0b',
          purple: '#5a189a',
          green: '#39ff14',
        },
        retro: {
          bg: '#1a0033',
          purple: '#5a189a',
          dark: '#0a0014',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        pixel: ['Press Start 2P', 'cursive'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glitch': 'glitch 1s infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 20px #00f5ff',
        'neon-pink': '0 0 20px #ff006e',
        'neon-yellow': '0 0 20px #ffbe0b',
      },
    },
  },
  plugins: [],
}
