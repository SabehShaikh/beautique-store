'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { STORAGE_KEYS } from '@/lib/constants'
import { adminApi } from '@/lib/api'
import type { Admin, AdminLogin, AuthContextType } from '@/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!token && !!admin

  // Check auth status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      // Try to fetch dashboard to verify token is valid
      // If it fails, token is invalid
      setToken(storedToken)

      // For now, we'll just check if token exists
      // In production, you'd validate the token with the backend
      const storedAdmin = localStorage.getItem('beautique-admin-user')
      if (storedAdmin) {
        try {
          const adminData = JSON.parse(storedAdmin) as Admin
          setAdmin(adminData)
        } catch {
          // Invalid stored admin data
          localStorage.removeItem('beautique-admin-user')
        }
      }
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem('beautique-admin-user')
      setToken(null)
      setAdmin(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials: AdminLogin) => {
    setIsLoading(true)
    try {
      const response = await adminApi.login(credentials)

      // Store token and admin data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token)
      localStorage.setItem('beautique-admin-user', JSON.stringify(response.admin))

      setToken(response.access_token)
      setAdmin(response.admin)

      // Redirect to dashboard
      router.push('/admin/dashboard')
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem('beautique-admin-user')
    setToken(null)
    setAdmin(null)
    router.push('/admin/login')
  }, [router])

  const value: AuthContextType = {
    admin,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export { AuthContext }
