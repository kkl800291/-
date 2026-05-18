import type { Metadata } from 'next'
import { JetBrains_Mono, Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google'
import 'yet-another-react-lightbox/styles.css'
import './globals.css'

const bodyFont = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap'
})

const displayFont = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap'
})

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-mono',
  display: 'swap'
})

export const metadata: Metadata = {
  title: '上帝的画室',
  description: '一个专注的 AI 图片生成画室。'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}>{children}</body>
    </html>
  )
}
