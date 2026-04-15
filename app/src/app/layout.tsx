import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: {
    default: 'ytoo.studio',
    template: '%s | ytoo.studio',
  },
  description: '攝影・旅遊・生活記錄 — ytoo.studio 個人作品集',
  openGraph: {
    title: 'ytoo.studio',
    description: '攝影・旅遊・生活記錄',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <Providers>
          <div className="layout">
            <div className="layout-sidebar">
              <Sidebar />
            </div>
            <main className="layout-main">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
