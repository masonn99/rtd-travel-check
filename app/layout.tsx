import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'RTD Travel Check - Real-Time Payments Travel Validator',
  description: 'Check if Visa Real-Time Payments (RTP/RTD) are supported in your travel destinations',
  keywords: 'visa, real-time payments, RTD, RTP, travel, payments, international',
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
