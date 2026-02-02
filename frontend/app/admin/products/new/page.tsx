'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { ProductForm } from '@/components/forms/ProductForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { ProductFormValues } from '@/lib/validation'

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dy9nh3rnt'
const CLOUDINARY_UPLOAD_PRESET = 'beautique_products'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

export default function AdminNewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  // Map frontend category slugs to backend enum values
  const categoryMap: Record<string, string> = {
    'maxi': 'Maxi',
    'lehanga-choli': 'Lehanga Choli',
    'long-shirt': 'Long Shirt',
    'shalwar-kameez': 'Shalwar Kameez',
    'gharara': 'Gharara',
  }

  // Upload single image to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'products')

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Cloudinary upload error:', errorData)
      throw new Error(errorData.error?.message || 'Image upload failed')
    }

    const result = await response.json()
    return result.secure_url
  }

  const handleSubmit = async (data: ProductFormValues, images?: File[]) => {
    setIsSubmitting(true)
    setUploadStatus('')

    try {
      // Step 1: Upload images to Cloudinary FIRST
      const imageUrls: string[] = []

      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          setUploadStatus(`Uploading image ${i + 1} of ${images.length}...`)

          try {
            const url = await uploadImageToCloudinary(images[i])
            imageUrls.push(url)
          } catch (uploadError: any) {
            toast({
              title: 'Image upload failed',
              description: `Failed to upload image ${i + 1}: ${uploadError.message}`,
              variant: 'destructive',
            })
            setIsSubmitting(false)
            setUploadStatus('')
            return
          }
        }
      }

      setUploadStatus('Creating product...')

      // Step 2: Create product with Cloudinary image URLs
      // Explicitly convert booleans to ensure false values are sent correctly
      const productPayload = {
        name: data.name,
        description: data.description,
        regular_price: data.regular_price,
        sale_price: data.sale_price || null,
        category: categoryMap[data.category] as any,
        sizes: data.sizes,
        colors: data.colors,
        is_bestseller: Boolean(data.is_bestseller),
        is_active: Boolean(data.is_active),
        images: imageUrls, // Include Cloudinary URLs
      }

      await adminApi.products.create(productPayload)

      toast({
        title: 'Product created',
        description: 'The product has been created successfully.',
      })

      router.push('/admin/products')
    } catch (error: any) {
      console.error('Product creation error:', error)
      toast({
        title: 'Failed to create product',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      setUploadStatus('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product listing</p>
        </div>
      </div>

      {/* Upload Status Display */}
      {uploadStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-blue-700 font-medium">{uploadStatus}</span>
        </div>
      )}

      <ProductForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  )
}
