'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login')
    }
  }, [isLoading, isAuthenticated, pathname, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Login page - no sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Protected routes - require authentication
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Authenticated admin pages
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="pt-16 lg:pt-0 min-h-screen">
          <div className="p-6">{children}</div>
        </div>
      </main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  )
}
