import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Redirector',
  description: 'Universal API proxy service for serverless deployment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 