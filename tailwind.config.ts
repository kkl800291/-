import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C140F',
        paper: '#F6EFE3',
        panel: '#FFF9F1',
        moss: '#496B4B',
        coral: '#E26D5A',
        line: '#D8CBB8'
      },
      boxShadow: {
        workbench: '0 14px 40px rgba(28, 20, 15, 0.12)'
      }
    }
  },
  plugins: []
}

export default config
