'use client'

import { useAuthContext } from '@/context/AuthContext'

/**
 * Hook to access auth functionality
 * Must be used within AuthProvider
 */
export function useAuth() {
  return useAuthContext()
}
