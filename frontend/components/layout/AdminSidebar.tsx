'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo - Logo file (logo.png) should be placed in public/images/ by user */}
      <div className="p-6 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
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
          <div>
            <span className="text-xl font-bold text-primary block">Beautique</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header - Logo file (logo.png) should be placed in public/images/ by user */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 border-b bg-background">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Beautique Store"
            width={35}
            height={35}
            className="rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <span className="text-xl font-bold text-primary">Beautique</span>
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-background">
        <NavContent />
      </aside>
    </>
  )
}
