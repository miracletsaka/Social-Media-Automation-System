import React from "react"
import type { Metadata } from 'next'
import { Inter, Playfair_Display, Fira_Code } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Navbar from '@/components/navbar'

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' });
const firaCode = Fira_Code({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Agency Campaign Designer',
  description: 'Create stunning campaign visuals with draggable text, customizable fonts, and full editing control. Design professional marketing materials inspired by agency best practices.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={`${inter.variable} ${playfair.variable} ${firaCode.variable}`}>
      <div className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </div>
    </div>
  )
}
