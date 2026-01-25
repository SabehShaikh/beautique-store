/**
 * Product Types for Beautique Store
 */

export type ProductCategory =
  | 'maxi'
  | 'lehanga-choli'
  | 'long-shirt'
  | 'shalwar-kameez'
  | 'gharara'

export type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL'

export interface Product {
  id: string
  name: string
  description: string
  regular_price: number
  sale_price?: number | null
  discount_percentage?: number | null
  effective_price?: number
  category: ProductCategory
  sizes: ProductSize[]
  colors: string[]  // Typically single color per product (each color variant is separate product)
  images: string[]
  is_bestseller: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// Backend category format (proper case with spaces)
export type BackendProductCategory =
  | 'Maxi'
  | 'Lehanga Choli'
  | 'Long Shirt'
  | 'Shalwar Kameez'
  | 'Gharara'

export interface ProductCreate {
  name: string
  description: string
  regular_price: number
  sale_price?: number | null
  category: ProductCategory | BackendProductCategory | string
  sizes: ProductSize[]
  colors: string[]
  is_bestseller?: boolean
  is_active?: boolean
}

export interface ProductUpdate extends Partial<ProductCreate> {
  id: string
}

export interface ProductListParams {
  page?: number
  limit?: number
  category?: ProductCategory
  search?: string
  min_price?: number
  max_price?: number
  size?: ProductSize
  color?: string
  is_bestseller?: boolean
}

export interface ProductListResponse {
  items: Product[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Component Props
export interface ProductCardProps {
  product: Product
  className?: string
}

export interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

export interface ProductFilterProps {
  filters: ProductFilterState
  onFilterChange: (filters: ProductFilterState) => void
  className?: string
}

export interface ProductFilterState {
  category?: ProductCategory
  minPrice?: number
  maxPrice?: number
  sizes?: ProductSize[]
  colors?: string[]
}

export interface ImageGalleryProps {
  images: string[]
  productName: string
  className?: string
}
