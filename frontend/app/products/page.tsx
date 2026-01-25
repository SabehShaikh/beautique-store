'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { productsApi } from '@/lib/api'
import { PAGINATION } from '@/lib/constants'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilter } from '@/components/product/ProductFilter'
import { Pagination } from '@/components/common/Pagination'
import { SearchBar } from '@/components/common/SearchBar'
import type { Product, ProductFilterState, ProductListParams } from '@/types'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(1)
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

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: ProductListParams = {
        page: currentPage,
        limit: PAGINATION.DEFAULT_LIMIT,
        search: searchParams.get('search') || undefined,
        category: filters.category,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        size: filters.sizes?.[0], // API might support single size
        color: filters.colors?.[0], // API might support single color
      }

      const response = await productsApi.getProducts(params)
      setProducts(response.items)
      setTotalPages(response.total_pages)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, filters, searchParams])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateURL = (newFilters: ProductFilterState, page: number) => {
    const params = new URLSearchParams()

    if (searchParams.get('search')) {
      params.set('search', searchParams.get('search')!)
    }
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice))
    if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice))
    if (newFilters.sizes?.length) params.set('sizes', newFilters.sizes.join(','))
    if (newFilters.colors?.length) params.set('colors', newFilters.colors.join(','))
    if (page > 1) params.set('page', String(page))

    const query = params.toString()
    router.push(query ? `/products?${query}` : '/products')
  }

  const handleFilterChange = (newFilters: ProductFilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateURL(newFilters, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURL(filters, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
            : `${products.length} products found`}
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
            products={products}
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
