'use client'

import { getWhatsAppLink } from '@/lib/constants'
import { MessageCircle } from 'lucide-react'

export function WhatsAppButton() {
  return (
    <a
      href={getWhatsAppLink('Hello! I have a question about Beautique Store.')}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
    </a>
  )
}
