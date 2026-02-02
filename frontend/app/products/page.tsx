'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { productsApi } from '@/lib/api'
import { PAGINATION } from '@/lib/constants'
import { categoryUrlToBackend } from '@/lib/utils'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilter } from '@/components/product/ProductFilter'
import { Pagination } from '@/components/common/Pagination'
import { SearchBar } from '@/components/common/SearchBar'
import type { Product, ProductFilterState, ProductListParams } from '@/types'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<ProductFilterState>({})

  // Parse initial filters from URL
  useEffect(() => {
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sizes = searchParams.get('sizes')
    const colors = searchParams.get('colors')
    const page = searchParams.get('page')

    setFilters({
      category: category as ProductFilterState['category'] || undefined,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      sizes: sizes ? sizes.split(',') as ProductFilterState['sizes'] : undefined,
      colors: colors ? colors.split(',') : undefined,
    })
    setCurrentPage(page ? parseInt(page) : 1)
  }, [searchParams])

  // Fetch products from API (only category filter goes to backend)
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const backendCategory = categoryUrlToBackend(filters.category)

      const params: ProductListParams = {
        page: 1,
        limit: 100, // Fetch more products for client-side filtering
        search: searchParams.get('search') || undefined,
        category: backendCategory as ProductListParams['category'],
      }

      const response = await productsApi.getProducts(params)
      setAllProducts(response.items)
    } catch (error) {
      setAllProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [filters.category, searchParams])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Client-side filtering for price, sizes, and colors
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    // Price filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      result = result.filter((product) => {
        const price = product.sale_price || product.regular_price
        const matchesMin = filters.minPrice === undefined || price >= filters.minPrice
        const matchesMax = filters.maxPrice === undefined || price <= filters.maxPrice
        return matchesMin && matchesMax
      })
    }

    // Size filter (OR logic - match ANY selected size)
    if (filters.sizes && filters.sizes.length > 0) {
      result = result.filter((product) =>
        product.sizes.some((size) => filters.sizes!.includes(size))
      )
    }

    // Color filter (OR logic - match ANY selected color)
    if (filters.colors && filters.colors.length > 0) {
      result = result.filter((product) =>
        product.colors.some((color) => filters.colors!.includes(color))
      )
    }

    return result
  }, [allProducts, filters.minPrice, filters.maxPrice, filters.sizes, filters.colors])

  // Pagination of filtered results
  const totalPages = Math.ceil(filteredProducts.length / PAGINATION.DEFAULT_LIMIT)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGINATION.DEFAULT_LIMIT
    const end = start + PAGINATION.DEFAULT_LIMIT
    return filteredProducts.slice(start, end)
  }, [filteredProducts, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const updateURL = useCallback((newFilters: ProductFilterState, page: number) => {
    const params = new URLSearchParams()

    const search = searchParams.get('search')
    if (search) {
      params.set('search', search)
    }
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice))
    if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice))
    if (newFilters.sizes?.length) params.set('sizes', newFilters.sizes.join(','))
    if (newFilters.colors?.length) params.set('colors', newFilters.colors.join(','))
    if (page > 1) params.set('page', String(page))

    const query = params.toString()
    router.push(query ? `/products?${query}` : '/products', { scroll: false })
  }, [router, searchParams])

  const handleFilterChange = useCallback((newFilters: ProductFilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateURL(newFilters, 1)
  }, [updateURL])

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
