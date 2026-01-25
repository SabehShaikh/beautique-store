'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Loader2 } from 'lucide-react'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  navigateOnSearch?: boolean
}

export function SearchBar({
  onSearch,
  placeholder = 'Search products...',
  className,
  navigateOnSearch = true,
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const [isSearching, setIsSearching] = useState(false)

  // Debounce search
  useEffect(() => {
    if (!onSearch) return

    const timeoutId = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, onSearch])

  const handleSearch = useCallback(() => {
    if (navigateOnSearch) {
      setIsSearching(true)
      const params = new URLSearchParams(searchParams.toString())
      if (query.trim()) {
        params.set('search', query.trim())
      } else {
        params.delete('search')
      }
      params.set('page', '1') // Reset to first page on search
      router.push(`/products?${params.toString()}`)
      setTimeout(() => setIsSearching(false), 500)
    }
  }, [query, router, searchParams, navigateOnSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setQuery('')
    if (onSearch) {
      onSearch('')
    }
    if (navigateOnSearch) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('search')
      router.push(`/products?${params.toString()}`)
    }
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      <Button
        type="button"
        onClick={handleSearch}
        disabled={isSearching}
        className="ml-2"
        size="icon"
      >
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        <span className="sr-only">Search</span>
      </Button>
    </div>
  )
}
