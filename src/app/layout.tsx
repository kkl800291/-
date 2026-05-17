import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RightCodes Image Studio',
  description: 'A focused image generation studio for Right Codes draw models.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
