/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    { pattern: /(bg|text|border)-(red|yellow|green|gray|blue|emerald|orange|violet|indigo)-(50|100|200|300|400|500|600|700|800|900)/ },
    'bg-gradient-to-r', 'from-green-500', 'to-emerald-600', 'text-white', 'text-white/70', 'text-white/80',
  ],
  theme: {
    extend: {
      colors: {
        forest: '#173f35',
        leaf: '#3d7654',
        lime: '#d6ed83',
        canvas: '#f5f7f2',
      },
      boxShadow: {
        soft: '0 12px 34px rgba(25, 54, 40, .07)',
      },
    },
  },
  plugins: [],
}
