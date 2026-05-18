import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101114',
        paper: '#F4F0E7',
        panel: '#181B20',
        porcelain: '#FFF8E7',
        graphite: '#0B0D10',
        acid: '#D7FF4F',
        cyan: '#57D7F7',
        vermilion: '#FF5A36',
        moss: '#2D5D4D',
        coral: '#FF7A59',
        line: '#323741'
      },
      fontFamily: {
        display: ['var(--font-display)', '"Songti SC"', '"Noto Serif CJK SC"', '"Hiragino Mincho ProN"', 'serif'],
        body: ['var(--font-body)', '"Avenir Next"', '"PingFang SC"', '"Hiragino Sans GB"', 'sans-serif'],
        mono: ['var(--font-mono)', '"SFMono-Regular"', 'Menlo', 'Consolas', 'monospace']
      },
      boxShadow: {
        workbench: '0 18px 60px rgba(0, 0, 0, 0.32)',
        glow: '0 0 0 1px rgba(215, 255, 79, 0.18), 0 22px 80px rgba(87, 215, 247, 0.12)'
      }
    }
  },
  plugins: []
}

export default config
