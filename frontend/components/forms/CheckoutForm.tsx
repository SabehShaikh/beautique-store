'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validation'
import { PAYMENT_METHODS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormValues) => Promise<void>
  isLoading?: boolean
}

export function CheckoutForm({ onSubmit, isLoading = false }: CheckoutFormProps) {
  const [sameAsPhone, setSameAsPhone] = useState(true)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: '',
      country: '',
      notes: '',
      payment_method: undefined,
    },
  })

  const phone = form.watch('phone')

  const handleSameAsPhoneChange = (checked: boolean) => {
    setSameAsPhone(checked)
    if (checked) {
      form.setValue('whatsapp', phone)
    }
  }

  const handlePhoneChange = (value: string) => {
    form.setValue('phone', value)
    if (sameAsPhone) {
      form.setValue('whatsapp', value)
    }
  }

  const handleFormSubmit = async (data: CheckoutFormValues) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+92 300 1234567"
                        {...field}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+92 300 1234567"
                        {...field}
                        disabled={sameAsPhone}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAsPhone"
                checked={sameAsPhone}
                onCheckedChange={handleSameAsPhoneChange}
              />
              <Label htmlFor="sameAsPhone" className="text-sm cursor-pointer">
                WhatsApp number is same as phone
              </Label>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="House/Flat number, Street name, Area"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Pakistan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Special instructions for delivery..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((method) => (
                        <label
                          key={method.value}
                          className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                            field.value === method.value
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-muted-foreground/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_method"
                            value={method.value}
                            checked={field.value === method.value}
                            onChange={() => field.onChange(method.value)}
                            className="h-4 w-4 accent-primary"
                          />
                          <span className="font-medium">{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              After placing your order, you will receive payment instructions.
              Please send payment confirmation via WhatsApp.
            </p>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            'Place Order'
          )}
        </Button>
      </form>
    </Form>
  )
}
