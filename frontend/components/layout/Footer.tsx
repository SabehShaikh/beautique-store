'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  CATEGORIES,
  getWhatsAppLink,
  PAYMENT_METHODS,
  PHONE_NUMBERS,
  STORE_INFO,
  SOCIAL_LINKS,
  BUSINESS_HOURS
} from '@/lib/constants'
import { Separator } from '@/components/ui/separator'
import {
  Facebook,
  Instagram,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-primary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              {/* Logo file (logo.png) should be placed in public/images/ by user */}
              <Image
                src="/images/logo.png"
                alt="Beautique Store"
                width={45}
                height={45}
                className="rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="text-2xl font-bold text-primary">Beautique</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Discover elegant traditional Pakistani clothing for every
              occasion. Quality craftsmanship meets timeless style.
            </p>
            <div className="mt-4 flex space-x-4">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
                >
                  Privacy & Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.map((category) => (
                <li key={category.value}>
                  <Link
                    href={`/products/${category.value}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <p>{PHONE_NUMBERS.primary}</p>
                  <p>{PHONE_NUMBERS.secondary}</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <a
                  href={getWhatsAppLink('Hello! I have a question about Beautique Store.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
                >
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {STORE_INFO.address}<br />
                  {STORE_INFO.city}, {STORE_INFO.country}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  {BUSINESS_HOURS.map((schedule, idx) => (
                    <p key={idx}>{schedule.days}: {schedule.hours}</p>
                  ))}
                </div>
              </li>
            </ul>

            {/* Payment Methods */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Payment Methods</h4>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <span
                    key={method.value}
                    className="text-xs bg-muted px-2 py-1 rounded"
                  >
                    {method.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {currentYear} Beautique Store. All rights reserved.</p>
          <p>
            Designed with love for traditional fashion enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  )
}
