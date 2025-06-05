import { Inter } from 'next/font/google'
import { Providers } from './providers'
import '@rainbow-me/rainbowkit/styles.css'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Prediction Admin Dashboard',
  description: 'Admin panel for managing blockchain predictions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
