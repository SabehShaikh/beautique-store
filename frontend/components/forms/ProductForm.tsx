'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { productSchema, type ProductFormValues } from '@/lib/validation'
import { CATEGORIES, SIZES } from '@/lib/constants'
import { calculateDiscount } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, X } from 'lucide-react'
import type { Product, ProductSize } from '@/types'

interface ProductFormProps {
  initialData?: Product
  onSubmit: (data: ProductFormValues, images?: File[]) => Promise<void>
  isLoading?: boolean
}

// Reverse map backend category values to frontend slug format
const backendToFrontendCategory: Record<string, string> = {
  'Maxi': 'maxi',
  'Lehanga Choli': 'lehanga-choli',
  'Long Shirt': 'long-shirt',
  'Shalwar Kameez': 'shalwar-kameez',
  'Gharara': 'gharara',
}

export function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(
    initialData?.images || []
  )
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null)

  // Convert backend category format to frontend format for editing
  const normalizedCategory = initialData?.category
    ? (backendToFrontendCategory[initialData.category] || initialData.category)
    : undefined

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      regular_price: initialData?.regular_price || 0,
      sale_price: initialData?.sale_price || null,
      category: normalizedCategory as any,
      sizes: initialData?.sizes || [],
      colors: initialData?.colors || [],
      is_bestseller: initialData?.is_bestseller || false,
      is_active: initialData?.is_active ?? true,
    },
  })

  const sizes = form.watch('sizes')
  const regularPrice = form.watch('regular_price')
  const salePrice = form.watch('sale_price')

  // Calculate discount percentage when prices change
  useEffect(() => {
    if (regularPrice && salePrice && salePrice < regularPrice) {
      setDiscountPercentage(calculateDiscount(regularPrice, salePrice))
    } else {
      setDiscountPercentage(null)
    }
  }, [regularPrice, salePrice])

  const handleSizeChange = (size: ProductSize, checked: boolean) => {
    if (checked) {
      form.setValue('sizes', [...sizes, size])
    } else {
      form.setValue(
        'sizes',
        sizes.filter((s) => s !== size)
      )
    }
  }

  const handleColorChange = (color: string) => {
    // Single color per product - store as array with single element
    form.setValue('colors', color.trim() ? [color.trim()] : [])
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files])
      // Create preview URLs
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls])
    }
  }

  const handleRemoveImage = (index: number) => {
    // Check if it's a new image or existing
    const existingImagesCount = initialData?.images?.length || 0
    if (index >= existingImagesCount) {
      // Remove from selected files
      const newImageIndex = index - existingImagesCount
      setSelectedImages((prev) => prev.filter((_, i) => i !== newImageIndex))
    }
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (data: ProductFormValues) => {
    await onSubmit(data, selectedImages.length > 0 ? selectedImages : undefined)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product description"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pricing Section */}
              <div className="space-y-4 pt-2">
                <h3 className="font-medium text-sm">Pricing</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="regular_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regular Price (PKR) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price (PKR)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Leave empty if not on sale"
                            min="0"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(value === '' ? null : parseFloat(value) || 0)
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional. Must be less than regular price.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Discount Percentage Display */}
                {discountPercentage !== null && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">
                      Discount: {discountPercentage}% OFF
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sizes */}
              <FormField
                control={form.control}
                name="sizes"
                render={() => (
                  <FormItem>
                    <FormLabel>Available Sizes *</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                          <Checkbox
                            id={`size-${size}`}
                            checked={sizes.includes(size)}
                            onCheckedChange={(checked) =>
                              handleSizeChange(size, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`size-${size}`}
                            className="text-sm cursor-pointer"
                          >
                            {size}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color - Single color per product */}
              <FormField
                control={form.control}
                name="colors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Color *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., White, Golden, Navy Blue"
                        value={field.value?.[0] || ''}
                        onChange={(e) => handleColorChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Each color variant should be a separate product (e.g., "Liana Maxi - White", "Liana Maxi - Golden")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Flags */}
              <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="is_bestseller"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 cursor-pointer">
                        Mark as Bestseller
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 cursor-pointer">
                        Active (visible to customers)
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
                <span className="text-sm text-muted-foreground">
                  Upload 1-10 images (max 5MB each)
                </span>
              </div>

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                      <Image
                        src={url}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs">
                          Main
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initialData ? (
              'Update Product'
            ) : (
              'Create Product'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
