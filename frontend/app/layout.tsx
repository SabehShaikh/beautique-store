import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'

const inter = Inter({ subsets: ['latin'] })

// Favicon will use logo.png once placed in public/images/
export const metadata: Metadata = {
  title: 'Beautique Store - Premium Pakistani Fashion',
  description: 'Shop premium Pakistani fashion including Maxi, Lehanga Choli, Long Shirt, Shalwar Kameez, and Gharara. Quality traditional wear delivered to your doorstep.',
  keywords: ['Pakistani fashion', 'Maxi', 'Lehanga Choli', 'Shalwar Kameez', 'Gharara', 'Traditional wear'],
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <WishlistProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <WhatsAppButton />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}
