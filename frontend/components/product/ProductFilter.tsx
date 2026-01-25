'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CATEGORIES, SIZES, COLORS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-react'
import type { ProductFilterState, ProductCategory, ProductSize } from '@/types'

interface ProductFilterProps {
  filters: ProductFilterState
  onFilterChange: (filters: ProductFilterState) => void
  className?: string
}

export function ProductFilter({
  filters,
  onFilterChange,
  className,
}: ProductFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFilterCount = getActiveFilterCount(filters)

  const handleCategoryChange = (category: ProductCategory, checked: boolean) => {
    onFilterChange({
      ...filters,
      category: checked ? category : undefined,
    })
  }

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined
    onFilterChange({
      ...filters,
      [field]: numValue,
    })
  }

  const handleSizeChange = (size: ProductSize, checked: boolean) => {
    const currentSizes = filters.sizes || []
    const newSizes = checked
      ? [...currentSizes, size]
      : currentSizes.filter((s) => s !== size)
    onFilterChange({
      ...filters,
      sizes: newSizes.length > 0 ? newSizes : undefined,
    })
  }

  const handleColorChange = (color: string, checked: boolean) => {
    const currentColors = filters.colors || []
    const newColors = checked
      ? [...currentColors, color]
      : currentColors.filter((c) => c !== color)
    onFilterChange({
      ...filters,
      colors: newColors.length > 0 ? newColors : undefined,
    })
  }

  const handleClearAll = () => {
    onFilterChange({})
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{activeFilterCount} filters active</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={['category', 'price', 'size', 'color']}
      >
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {CATEGORIES.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={filters.category === category.value}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(
                        category.value as ProductCategory,
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    htmlFor={`category-${category.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
                  Min (PKR)
                </Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                  min={0}
                />
              </div>
              <span className="text-muted-foreground mt-5">-</span>
              <div className="flex-1">
                <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
                  Max (PKR)
                </Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Any"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                  min={0}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Size Filter */}
        <AccordionItem value="size">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={filters.sizes?.includes(size as ProductSize) || false}
                    onCheckedChange={(checked) =>
                      handleSizeChange(size as ProductSize, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`size-${size}`}
                    className="text-sm cursor-pointer"
                  >
                    {size}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color Filter */}
        <AccordionItem value="color">
          <AccordionTrigger>Color</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2">
              {COLORS.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={filters.colors?.includes(color) || false}
                    onCheckedChange={(checked) =>
                      handleColorChange(color, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`color-${color}`}
                    className="text-sm cursor-pointer"
                  >
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button & Sheet */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn('hidden lg:block', className)}>
        <h2 className="mb-4 text-lg font-semibold">Filters</h2>
        <FilterContent />
      </div>
    </>
  )
}

function getActiveFilterCount(filters: ProductFilterState): number {
  let count = 0
  if (filters.category) count++
  if (filters.minPrice !== undefined) count++
  if (filters.maxPrice !== undefined) count++
  if (filters.sizes?.length) count += filters.sizes.length
  if (filters.colors?.length) count += filters.colors.length
  return count
}
