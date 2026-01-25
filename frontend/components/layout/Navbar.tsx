'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SearchBar } from '@/components/common/SearchBar'
import {
  Menu,
  ShoppingCart,
  Heart,
  ChevronDown,
  Search,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function Navbar() {
  const pathname = usePathname()
  const { getCartCount } = useCart()
  const { getWishlistCount } = useWishlist()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const cartCount = getCartCount()
  const wishlistCount = getWishlistCount()

  // Don't show navbar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Logo file (logo.png) should be placed in public/images/ by user */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logo.png"
              alt="Beautique Store"
              width={45}
              height={45}
              className="rounded-lg"
              priority
              onError={(e) => {
                // Fallback if logo not found
                e.currentTarget.style.display = 'none'
              }}
            />
            <span className="text-xl font-bold text-primary">Beautique</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={cn(
                'text-sm font-medium transition-all duration-200 hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-200 hover:after:w-full',
                pathname === '/' ? 'text-primary after:w-full' : 'text-foreground'
              )}
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 hover:bg-primary/10 hover:text-primary transition-all duration-200">
                  <span>Categories</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/products" className="w-full cursor-pointer">
                    All Products
                  </Link>
                </DropdownMenuItem>
                {CATEGORIES.map((category) => (
                  <DropdownMenuItem key={category.value} asChild>
                    <Link
                      href={`/products/${category.value}`}
                      className="w-full cursor-pointer"
                    >
                      {category.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/track-order"
              className={cn(
                'text-sm font-medium transition-all duration-200 hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-200 hover:after:w-full',
                pathname === '/track-order'
                  ? 'text-primary after:w-full'
                  : 'text-foreground'
              )}
            >
              Track Order
            </Link>
          </nav>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded-md" />}>
              <SearchBar />
            </Suspense>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:text-accent"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              {mobileSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>

            {/* Wishlist */}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative group/wishlist hover:bg-red-50">
                <Heart className="h-5 w-5 transition-all duration-200 group-hover/wishlist:text-red-500 group-hover/wishlist:scale-110" />
                {wishlistCount > 0 && (
                  <Badge
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative group/cart hover:bg-primary/10">
                <ShoppingCart className="h-5 w-5 transition-all duration-200 group-hover/cart:text-primary group-hover/cart:scale-110" />
                {cartCount > 0 && (
                  <Badge
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:text-accent">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-background">
                <SheetHeader>
                  <SheetTitle>
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2"
                    >
                      {/* Logo file (logo.png) should be placed in public/images/ by user */}
                      <Image
                        src="/images/logo.png"
                        alt="Beautique Store"
                        width={40}
                        height={40}
                        className="rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <span className="text-xl font-bold text-primary">Beautique</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col space-y-4">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium hover:text-accent transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium hover:text-accent transition-colors"
                  >
                    All Products
                  </Link>
                  <div className="border-t border-primary/10 pt-4">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Categories
                    </p>
                    {CATEGORIES.map((category) => (
                      <Link
                        key={category.value}
                        href={`/products/${category.value}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-lg hover:text-accent transition-colors"
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-primary/10 pt-4">
                    <Link
                      href="/track-order"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium hover:text-accent transition-colors"
                    >
                      Track Order
                    </Link>
                  </div>
                  <div className="border-t border-primary/10 pt-4">
                    <Link
                      href="/about"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-lg hover:text-accent transition-colors"
                    >
                      About Us
                    </Link>
                    <Link
                      href="/support"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-lg hover:text-accent transition-colors"
                    >
                      Support
                    </Link>
                    <Link
                      href="/legal"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-lg hover:text-accent transition-colors"
                    >
                      Legal
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="pb-4 md:hidden">
            <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded-md" />}>
              <SearchBar />
            </Suspense>
          </div>
        )}
      </div>
    </header>
  )
}
