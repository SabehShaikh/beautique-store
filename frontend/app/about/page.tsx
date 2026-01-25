import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react'
import {
  STORE_INFO,
  PHONE_NUMBERS,
  BUSINESS_HOURS,
  getWhatsAppLink,
} from '@/lib/constants'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Beautique Store</h1>
          <p className="text-lg text-muted-foreground">
            Your destination for premium Pakistani fashion
          </p>
        </div>

        {/* Story */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <div className="prose prose-muted max-w-none">
            <p className="text-muted-foreground mb-4">
              Beautique Store was founded with a passion for bringing the finest
              Pakistani fashion to customers. We believe that traditional
              wear should be accessible, affordable, and of the highest quality.
            </p>
            <p className="text-muted-foreground mb-4">
              Our collection features carefully curated pieces including Maxi,
              Lehanga Choli, Long Shirt, Shalwar Kameez, and Gharara - each crafted
              with attention to detail and quality materials.
            </p>
            <p className="text-muted-foreground">
              Whether you&apos;re shopping for a special occasion or everyday elegance,
              we have something for every style and budget.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="font-semibold mb-2">Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Premium fabrics and expert craftsmanship in every piece
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">💝</span>
                </div>
                <h3 className="font-semibold mb-2">Service</h3>
                <p className="text-sm text-muted-foreground">
                  Dedicated customer support via WhatsApp
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="font-semibold mb-2">Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Shipping nationwide across Pakistan
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Info */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Visit Us</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Store Location</p>
                  <p className="text-muted-foreground">
                    {STORE_INFO.name}
                    <br />
                    {STORE_INFO.address}
                    <br />
                    {STORE_INFO.city}, {STORE_INFO.country}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Phone Numbers</p>
                  <p className="text-muted-foreground">{PHONE_NUMBERS.primary}</p>
                  <p className="text-muted-foreground">{PHONE_NUMBERS.secondary}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-muted-foreground">{PHONE_NUMBERS.primary}</p>
                  <p className="text-muted-foreground">{PHONE_NUMBERS.secondary}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  {BUSINESS_HOURS.map((schedule, idx) => (
                    <p key={idx} className="text-muted-foreground">
                      {schedule.days}: {schedule.hours}
                    </p>
                  ))}
                </div>
              </div>
              <Button asChild className="mt-4">
                <a
                  href={getWhatsAppLink('Hi! I would like to visit your store.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact via WhatsApp
                </a>
              </Button>
            </div>
            {/* Google Map Embed - Saima Mall Karachi */}
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.5!2d67.0354!3d24.8776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e7e8f8e8e8f%3A0x8e8e8e8e8e8e8e8e!2sSaima%20Mall%20%26%20Residency%2C%20Karachi!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Beautique Store - Saima Mall Karachi"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
