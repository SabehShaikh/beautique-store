'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/forms/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { LoginFormValues } from '@/lib/validation'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/admin/dashboard')
    }
  }, [authLoading, isAuthenticated, router])

  const handleSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true)
    setError('')

    try {
      await login(data)
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid username or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            <span className="text-primary">Beautique</span> Admin
          </CardTitle>
          <CardDescription>
            Sign in to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  )
}
