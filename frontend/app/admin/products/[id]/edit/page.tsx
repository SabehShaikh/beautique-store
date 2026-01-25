'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { ProductForm } from '@/components/forms/ProductForm'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import { ArrowLeft, Trash2 } from 'lucide-react'
import type { Product } from '@/types'
import type { ProductFormValues } from '@/lib/validation'

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dy9nh3rnt'
const CLOUDINARY_UPLOAD_PRESET = 'beautique_products'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await adminApi.products.getOne(id)
        setProduct(data)
      } catch (error) {
        toast({
          title: 'Product not found',
          description: 'The product you are looking for does not exist.',
          variant: 'destructive',
        })
        router.push('/admin/products')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [id, router, toast])

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
    console.log('Cloudinary upload success:', result.secure_url)
    return result.secure_url
  }

  const handleSubmit = async (data: ProductFormValues, images?: File[]) => {
    setIsSubmitting(true)
    setUploadStatus('')

    try {
      // Step 1: Upload NEW images to Cloudinary
      const newImageUrls: string[] = []

      if (images && images.length > 0) {
        console.log(`Starting upload of ${images.length} new images to Cloudinary...`)

        for (let i = 0; i < images.length; i++) {
          setUploadStatus(`Uploading image ${i + 1} of ${images.length}...`)
          console.log(`Uploading image ${i + 1}/${images.length}: ${images[i].name}`)

          try {
            const url = await uploadImageToCloudinary(images[i])
            newImageUrls.push(url)
            console.log(`Image ${i + 1} uploaded: ${url}`)
          } catch (uploadError: any) {
            console.error(`Failed to upload image ${i + 1}:`, uploadError)
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

        console.log('All new images uploaded successfully:', newImageUrls)
      }

      setUploadStatus('Updating product...')

      // Step 2: Combine existing images with new uploads
      // The ProductForm passes existing images in imagePreviewUrls, but for edit
      // we need to track which existing images were kept
      const existingImages = product?.images || []
      const allImages = [...existingImages, ...newImageUrls]

      // Step 3: Update product with all image URLs
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
        images: newImageUrls.length > 0 ? allImages : undefined, // Only update images if new ones added
      }

      console.log('Updating product with payload:', JSON.stringify(productPayload, null, 2))

      await adminApi.products.update(id, productPayload)
      console.log('Product updated successfully')

      toast({
        title: 'Product updated',
        description: 'The product has been updated successfully.',
      })

      router.push('/admin/products')
    } catch (error: any) {
      console.error('Product update error:', error)
      toast({
        title: 'Failed to update product',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      setUploadStatus('')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await adminApi.products.delete(id)
      toast({
        title: 'Product deleted',
        description: 'The product has been deleted successfully.',
      })
      router.push('/admin/products')
    } catch (error: any) {
      toast({
        title: 'Failed to delete product',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-40 mt-1" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Product
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{product.name}&quot;? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Upload Status Display */}
      {uploadStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-blue-700 font-medium">{uploadStatus}</span>
        </div>
      )}

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}
