import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PHONE_NUMBERS } from '@/lib/constants'

export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Legal Information</h1>

        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          </TabsList>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                <p>
                  <strong>Last updated:</strong> January 2026
                </p>

                <h3 className="text-foreground font-semibold mt-6">1. Information We Collect</h3>
                <p>
                  When you place an order with Beautique Store, we collect the
                  following information:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name and contact information (phone, WhatsApp)</li>
                  <li>Shipping address (street, city, country)</li>
                  <li>Order details and preferences</li>
                  <li>Payment confirmation screenshots (sent via WhatsApp)</li>
                </ul>

                <h3 className="text-foreground font-semibold mt-6">2. How We Use Your Information</h3>
                <p>Your information is used to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Process and fulfill your orders</li>
                  <li>Communicate order updates via WhatsApp</li>
                  <li>Verify payment receipts</li>
                  <li>Improve our services</li>
                </ul>

                <h3 className="text-foreground font-semibold mt-6">3. Data Storage</h3>
                <p>
                  Your cart and wishlist data are stored locally in your browser
                  and are not transmitted to our servers until you place an order.
                  Order data is securely stored and only accessible to authorized
                  personnel.
                </p>

                <h3 className="text-foreground font-semibold mt-6">4. Data Sharing</h3>
                <p>
                  We do not sell or share your personal information with third
                  parties except as necessary to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Process payments through our banking partners</li>
                  <li>Deliver your orders through courier services</li>
                  <li>Comply with legal requirements</li>
                </ul>

                <h3 className="text-foreground font-semibold mt-6">5. Your Rights</h3>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access your personal data</li>
                  <li>Request correction of incorrect data</li>
                  <li>Request deletion of your data</li>
                </ul>

                <h3 className="text-foreground font-semibold mt-6">6. Contact Us</h3>
                <p>
                  For privacy-related inquiries, contact us via WhatsApp at{' '}
                  {PHONE_NUMBERS.primary} or {PHONE_NUMBERS.secondary}.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle>Terms of Service</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                <p>
                  <strong>Last updated:</strong> January 2026
                </p>

                <h3 className="text-foreground font-semibold mt-6">1. Acceptance of Terms</h3>
                <p>
                  By using Beautique Store, you agree to these Terms of Service.
                  If you do not agree, please do not use our services.
                </p>

                <h3 className="text-foreground font-semibold mt-6">2. Orders and Payment</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>All prices are in Pakistani Rupees (PKR)</li>
                  <li>
                    Payment must be made via Easypaisa or Meezan Bank Transfer
                  </li>
                  <li>
                    Orders are processed after payment verification via WhatsApp
                  </li>
                  <li>Cash on Delivery (COD) is not available</li>
                </ul>

                <h3 className="text-foreground font-semibold mt-6">3. Shipping</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Shipping costs are calculated based on location</li>
                  <li>Delivery times vary by destination</li>
                  <li>We are not responsible for delays caused by courier services</li>
                </ul>

                <h3 className="text-foreground font-semibold mt-6">4. Return Policy</h3>
                <p className="font-medium text-destructive">
                  NO returns are accepted.
                </p>

                <h3 className="text-foreground font-semibold mt-6">5. Exchange Policy</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Exchange is available for items in proper condition only
                  </li>
                  <li>
                    To initiate an exchange, contact us via WhatsApp at{' '}
                    {PHONE_NUMBERS.primary} or {PHONE_NUMBERS.secondary}
                  </li>
                  <li>All items must be unworn, unwashed, and with original tags attached</li>
                  <li>Exchange must be requested within 3 days of delivery</li>
                </ul>

                <h3 className="text-foreground font-semibold mt-6">6. Product Information</h3>
                <p>
                  We strive to display accurate product images and descriptions.
                  Colors may vary slightly due to monitor settings. Measurements
                  are approximate and may vary slightly.
                </p>

                <h3 className="text-foreground font-semibold mt-6">7. Limitation of Liability</h3>
                <p>
                  Beautique Store is not liable for any indirect, incidental, or
                  consequential damages arising from the use of our products or
                  services.
                </p>

                <h3 className="text-foreground font-semibold mt-6">8. Changes to Terms</h3>
                <p>
                  We reserve the right to modify these terms at any time. Changes
                  will be posted on this page with an updated date.
                </p>

                <h3 className="text-foreground font-semibold mt-6">9. Contact</h3>
                <p>
                  For questions about these terms, contact us via WhatsApp at{' '}
                  {PHONE_NUMBERS.primary} or {PHONE_NUMBERS.secondary}.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
