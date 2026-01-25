'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { adminApi } from '@/lib/api'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { PAGINATION } from '@/lib/constants'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/common/Pagination'
import { SearchBar } from '@/components/common/SearchBar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Edit, Eye, Archive, Trash2, RotateCcw } from 'lucide-react'
import type { Product } from '@/types'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await adminApi.products.getAll({
        page: currentPage,
        limit: PAGINATION.ADMIN_LIMIT,
        search: searchQuery || undefined,
      })
      setProducts(response?.items || [])
      setTotalPages(response?.total_pages || 1)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Soft delete (deactivate product)
  const handleSoftDelete = async (productId: string, productName: string) => {
    try {
      await adminApi.products.delete(productId)
      toast({
        title: 'Product deactivated',
        description: `"${productName}" has been deactivated and hidden from customers.`,
      })
      fetchProducts()
    } catch (error) {
      toast({
        title: 'Failed to deactivate product',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    }
  }

  // Hard delete (permanently remove product)
  const handlePermanentDelete = async (productId: string, productName: string) => {
    try {
      await adminApi.products.permanentDelete(productId)
      toast({
        title: 'Product permanently deleted',
        description: `"${productName}" has been permanently removed from the database.`,
      })
      fetchProducts()
    } catch (error) {
      toast({
        title: 'Failed to delete product',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    }
  }

  const getCategoryLabel = (category: string) => {
    // Handle both slug format and proper case format from backend
    const labels: Record<string, string> = {
      'maxi': 'Maxi',
      'Maxi': 'Maxi',
      'lehanga-choli': 'Lehanga Choli',
      'Lehanga Choli': 'Lehanga Choli',
      'long-shirt': 'Long Shirt',
      'Long Shirt': 'Long Shirt',
      'shalwar-kameez': 'Shalwar Kameez',
      'Shalwar Kameez': 'Shalwar Kameez',
      'gharara': 'Gharara',
      'Gharara': 'Gharara',
    }
    return labels[category] || category
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search products..."
        />
      </div>

      {/* Products Table */}
      <div className="rounded-md border bg-card">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={product.images?.[0] || '/images/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      {product.is_bestseller && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Bestseller
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryLabel(product.category)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {product.sale_price != null && product.sale_price < product.regular_price ? (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.regular_price)}
                          </span>
                          <span className="font-medium text-primary">
                            {formatPrice(product.sale_price)}
                          </span>
                          <Badge variant="secondary" className="w-fit text-xs mt-0.5 bg-red-100 text-red-600">
                            {calculateDiscount(product.regular_price, product.sale_price)}% OFF
                          </Badge>
                        </>
                      ) : (
                        <span className="font-medium">
                          {formatPrice(product.regular_price)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.is_active ? 'default' : 'secondary'}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* View */}
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        title="View"
                      >
                        <Link href={`/products/detail/${product.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      {/* Edit */}
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        title="Edit"
                      >
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      {/* Soft Delete (Deactivate) */}
                      {product.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Deactivate"
                          onClick={() => handleSoftDelete(product.id, product.name)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Permanent Delete - with confirmation */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Permanently Delete"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete
                              <strong className="text-foreground"> &quot;{product.name}&quot; </strong>
                              from the database. All associated data will be lost forever.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handlePermanentDelete(product.id, product.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Permanently Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No products found for "${searchQuery}"`
                : 'No products yet'}
            </p>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
