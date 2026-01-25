import Link from 'next/link'
import Image from 'next/image'
import { productsApi } from '@/lib/api'
import { CATEGORIES } from '@/lib/constants'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import type { Product } from '@/types'

export default async function HomePage() {
  let bestsellers: Product[] = []

  try {
    bestsellers = await productsApi.getBestsellers(8)
  } catch (error) {
    console.error('Failed to fetch bestsellers:', error)
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] w-full bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container mx-auto flex h-full items-center px-4">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Discover Premium
              <span className="block text-primary">Pakistani Fashion</span>
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Explore our exquisite collection of traditional wear including
              Maxi, Lehanga Choli, Long Shirt, Shalwar Kameez, and Gharara.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Bestsellers</h2>
            <p className="text-muted-foreground">
              Our most popular products loved by customers
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products?is_bestseller=true">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {bestsellers && bestsellers.length > 0 ? (
          <ProductGrid products={bestsellers} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No bestsellers available at the moment.</p>
            <Button asChild className="mt-4">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Shop by Category</h2>
            <p className="text-muted-foreground">
              Find the perfect outfit for every occasion
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {CATEGORIES.map((category) => (
              <Link key={category.value} href={`/products/${category.value}`}>
                <Card className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-secondary/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary/20 group-hover:text-primary/30 transition-colors">
                        {category.label.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {category.label}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="font-semibold">Quality Products</h3>
            <p className="text-sm text-muted-foreground">
              Premium fabrics and craftsmanship
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold">Fast Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Quick shipping nationwide
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="font-semibold">Secure Payment</h3>
            <p className="text-sm text-muted-foreground">
              Multiple payment options
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold">24/7 Support</h3>
            <p className="text-sm text-muted-foreground">
              WhatsApp support available
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to Shop?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl">
            Browse our complete collection and find your perfect outfit today.
            Quality guaranteed with easy payment options.
          </p>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="mt-6"
          >
            <Link href="/products">
              Explore Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
