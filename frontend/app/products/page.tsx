'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PAGINATION } from '@/lib/constants'
import { categoryUrlToBackend } from '@/lib/utils'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilter } from '@/components/product/ProductFilter'
import { Pagination } from '@/components/common/Pagination'
import { SearchBar } from '@/components/common/SearchBar'
import type { Product, ProductFilterState } from '@/types'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<ProductFilterState>({})

  // Parse initial filters from URL on mount
  useEffect(() => {
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = searchParams.get('page')

    const newFilters: ProductFilterState = {}
    if (category) newFilters.category = category as ProductFilterState['category']
    if (minPrice) newFilters.minPrice = parseInt(minPrice)
    if (maxPrice) newFilters.maxPrice = parseInt(maxPrice)

    setFilters(newFilters)
    setCurrentPage(page ? parseInt(page) : 1)
  }, [searchParams])

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      // Build query params manually to match backend expectations
      const queryParams = new URLSearchParams()
      queryParams.set('page', '1')
      queryParams.set('limit', '50')

      // Add search if present
      const searchQuery = searchParams.get('search')
      if (searchQuery && searchQuery.trim()) {
        queryParams.set('search', searchQuery.trim())
      }

      // Add category if present (convert to backend format)
      if (filters.category) {
        const backendCategory = categoryUrlToBackend(filters.category)
        if (backendCategory) {
          queryParams.set('category', backendCategory)
        }
      }

      // Fetch directly with proper query string
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/products?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setAllProducts(data.items || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setAllProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [filters.category, searchParams])

  // Fetch when category or search changes
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Client-side filtering for price only
  const filteredProducts = useMemo(() => {
    let result = allProducts

    if (!result || result.length === 0) {
      return []
    }

    // Price filter - only apply if values are set
    const hasMinPrice = typeof filters.minPrice === 'number' && !isNaN(filters.minPrice)
    const hasMaxPrice = typeof filters.maxPrice === 'number' && !isNaN(filters.maxPrice)

    if (hasMinPrice || hasMaxPrice) {
      result = result.filter((product) => {
        const price = product.sale_price ?? product.regular_price
        if (hasMinPrice && price < filters.minPrice!) return false
        if (hasMaxPrice && price > filters.maxPrice!) return false
        return true
      })
    }

    return result
  }, [allProducts, filters.minPrice, filters.maxPrice])

  // Pagination of filtered results
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGINATION.DEFAULT_LIMIT))

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGINATION.DEFAULT_LIMIT
    const end = start + PAGINATION.DEFAULT_LIMIT
    return filteredProducts.slice(start, end)
  }, [filteredProducts, currentPage])

  // Reset to page 1 when filtered results change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Update URL with current filters
  const updateURL = useCallback((newFilters: ProductFilterState, page: number) => {
    const params = new URLSearchParams()

    const search = searchParams.get('search')
    if (search) params.set('search', search)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice))
    if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice))
    if (page > 1) params.set('page', String(page))

    const query = params.toString()
    router.push(query ? `/products?${query}` : '/products', { scroll: false })
  }, [router, searchParams])

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: ProductFilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateURL(newFilters, 1)
  }, [updateURL])

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    updateURL(filters, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [filters, updateURL])

  const searchQuery = searchParams.get('search')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isLoading
            ? 'Loading products...'
            : `${filteredProducts.length} products found`}
        </p>
      </div>

      {/* Mobile Search */}
      <div className="lg:hidden mb-6">
        <SearchBar />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilter
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <ProductGrid
            products={paginatedProducts}
            isLoading={isLoading}
            emptyMessage={
              searchQuery
                ? `No products found for "${searchQuery}"`
                : 'No products match your filters'
            }
          />

          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
