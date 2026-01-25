'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getWhatsAppLink, PHONE_NUMBERS, SOCIAL_LINKS } from '@/lib/constants'
import { ContactForm } from '@/components/forms/ContactForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Phone, MessageCircle, HelpCircle, Instagram, Facebook } from 'lucide-react'
import type { ContactFormValues } from '@/lib/validation'

const faqItems = [
  {
    question: 'How do I place an order?',
    answer:
      'Simply browse our products, add items to your cart, proceed to checkout, and fill in your details. After placing your order, you will receive payment instructions.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept Easypaisa and Meezan Bank Transfer. After making the payment, please send a screenshot of the transaction via WhatsApp for verification.',
  },
  {
    question: 'Do you offer Cash on Delivery (COD)?',
    answer:
      'No, we currently do not offer Cash on Delivery. All payments must be made in advance through our accepted payment methods.',
  },
  {
    question: 'How can I track my order?',
    answer:
      'You can track your order by visiting the "Track Order" page and entering your Order ID and phone number. You will also receive updates via WhatsApp.',
  },
  {
    question: 'What is your return/exchange policy?',
    answer:
      'We do NOT accept returns. However, exchange is available for items in proper condition only. Items must be unworn, unwashed, and with original tags attached. Exchange must be requested within 3 days of delivery. Contact us via WhatsApp at 0313-2306429 or 0333-2306429 to initiate an exchange.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Delivery times vary by location. Within major cities, expect 2-4 business days. For other areas, it may take 5-7 business days.',
  },
  {
    question: 'Are the product colors accurate?',
    answer:
      'We strive to display accurate colors, but they may vary slightly due to monitor settings and lighting conditions in photographs. If you have concerns, please contact us before ordering.',
  },
  {
    question: 'Can I modify or cancel my order?',
    answer:
      'Please contact us via WhatsApp immediately if you need to modify or cancel your order. Changes can only be made before the order is processed.',
  },
]

export default function SupportPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContactSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: 'Message sent!',
      description: 'We will contact you via WhatsApp soon.',
    })

    setIsSubmitting(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Support</h1>
          <p className="text-muted-foreground">
            Find answers to common questions or get in touch with us
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* FAQ Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Phone Numbers</p>
                    <p className="text-sm text-muted-foreground">
                      {PHONE_NUMBERS.primary}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {PHONE_NUMBERS.secondary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">
                      {PHONE_NUMBERS.primary}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {PHONE_NUMBERS.secondary}
                    </p>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Instagram className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Follow Us</p>
                    <div className="flex gap-4 mt-1">
                      <a
                        href={SOCIAL_LINKS.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Instagram className="h-4 w-4" /> Instagram
                      </a>
                      <a
                        href={SOCIAL_LINKS.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Facebook className="h-4 w-4" /> Facebook
                      </a>
                    </div>
                  </div>
                </div>

                <Button asChild className="w-full mt-4">
                  <a
                    href={getWhatsAppLink('Hi! I need help with my order.')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm
                  onSubmit={handleContactSubmit}
                  isLoading={isSubmitting}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
