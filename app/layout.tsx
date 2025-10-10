import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'RTD Travel Check - Visa requirements for US refugee travel document holders',
  description: 'A platform where refugee travel document holders share their travel experience, from traveling visa-free to visa-application process',
  keywords: 'visa, RTD, Refugee travel document, i-131, i-571, visa requirements'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
