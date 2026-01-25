'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useSearchParams, useRouter, notFound } from 'next/navigation'
import { productsApi } from '@/lib/api'
import { CATEGORIES, PAGINATION } from '@/lib/constants'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilter } from '@/components/product/ProductFilter'
import { Pagination } from '@/components/common/Pagination'
import type { Product, ProductFilterState, ProductListParams, ProductCategory } from '@/types'

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

// Map URL slugs to backend category names (proper case)
const categorySlugToBackend: Record<string, string> = {
  'maxi': 'Maxi',
  'lehanga-choli': 'Lehanga Choli',
  'long-shirt': 'Long Shirt',
  'shalwar-kameez': 'Shalwar Kameez',
  'gharara': 'Gharara',
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<ProductFilterState>({})

  // Validate category
  const validCategory = CATEGORIES.find((c) => c.value === category)
  if (!validCategory) {
    notFound()
  }

  // Get backend category name for API calls
  const backendCategory = categorySlugToBackend[category]

  // Parse initial filters from URL
  useEffect(() => {
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sizes = searchParams.get('sizes')
    const colors = searchParams.get('colors')
    const page = searchParams.get('page')

    setFilters({
      category: category as ProductCategory,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      sizes: sizes ? sizes.split(',') as ProductFilterState['sizes'] : undefined,
      colors: colors ? colors.split(',') : undefined,
    })
    setCurrentPage(page ? parseInt(page) : 1)
  }, [searchParams, category])

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: ProductListParams = {
        page: currentPage,
        limit: PAGINATION.DEFAULT_LIMIT,
        category: backendCategory as ProductCategory, // Use proper case for backend
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        size: filters.sizes?.[0],
        color: filters.colors?.[0],
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
  }, [currentPage, filters, backendCategory])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateURL = (newFilters: ProductFilterState, page: number) => {
    const params = new URLSearchParams()

    if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice))
    if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice))
    if (newFilters.sizes?.length) params.set('sizes', newFilters.sizes.join(','))
    if (newFilters.colors?.length) params.set('colors', newFilters.colors.join(','))
    if (page > 1) params.set('page', String(page))

    const query = params.toString()
    router.push(query ? `/products/${category}?${query}` : `/products/${category}`)
  }

  const handleFilterChange = (newFilters: ProductFilterState) => {
    // If category changed, redirect to that category page
    if (newFilters.category && newFilters.category !== category) {
      router.push(`/products/${newFilters.category}`)
      return
    }

    setFilters({ ...newFilters, category: category as ProductCategory })
    setCurrentPage(1)
    updateURL(newFilters, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURL(filters, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{validCategory.label}</h1>
        <p className="text-muted-foreground mt-1">
          {isLoading
            ? 'Loading products...'
            : `${products.length} products found`}
        </p>
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
            emptyMessage={`No ${validCategory.label} products available`}
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
