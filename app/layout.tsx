import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'advanceCalculator',
  description: 'Created with love and code',
  generator: 'madroyd',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
