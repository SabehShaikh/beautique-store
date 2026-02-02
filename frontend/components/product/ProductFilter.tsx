'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { ProductFilterState, ProductCategory } from '@/types'

interface ProductFilterProps {
  filters: ProductFilterState
  onFilterChange: (filters: ProductFilterState) => void
  className?: string
}

// Format number with commas
function formatNumber(num: number): string {
  return num.toLocaleString('en-PK')
}

export function ProductFilter({
  filters,
  onFilterChange,
  className,
}: ProductFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Local state for price inputs - allows smooth typing
  const [localMinPrice, setLocalMinPrice] = useState('')
  const [localMaxPrice, setLocalMaxPrice] = useState('')

  // Refs for debounce timers
  const minPriceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const maxPriceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Sync local price state with filters prop (only on external changes)
  useEffect(() => {
    if (filters.minPrice !== undefined) {
      setLocalMinPrice(formatNumber(filters.minPrice))
    } else {
      setLocalMinPrice('')
    }
  }, [filters.minPrice])

  useEffect(() => {
    if (filters.maxPrice !== undefined) {
      setLocalMaxPrice(formatNumber(filters.maxPrice))
    } else {
      setLocalMaxPrice('')
    }
  }, [filters.maxPrice])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (minPriceTimerRef.current) clearTimeout(minPriceTimerRef.current)
      if (maxPriceTimerRef.current) clearTimeout(maxPriceTimerRef.current)
    }
  }, [])

  const activeFilterCount = getActiveFilterCount(filters)

  const handleCategoryChange = (category: ProductCategory, checked: boolean) => {
    onFilterChange({
      ...filters,
      category: checked ? category : undefined,
    })
  }

  // Handle min price input with debounce
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '')
    const numValue = rawValue ? parseInt(rawValue, 10) : 0

    // Update local state immediately for smooth typing
    setLocalMinPrice(numValue ? formatNumber(numValue) : '')

    // Clear existing timer
    if (minPriceTimerRef.current) {
      clearTimeout(minPriceTimerRef.current)
    }

    // Debounce the filter update
    minPriceTimerRef.current = setTimeout(() => {
      onFilterChange({
        ...filters,
        minPrice: numValue || undefined,
      })
    }, 300)
  }

  // Handle max price input with debounce
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '')
    const numValue = rawValue ? parseInt(rawValue, 10) : 0

    // Update local state immediately for smooth typing
    setLocalMaxPrice(numValue ? formatNumber(numValue) : '')

    // Clear existing timer
    if (maxPriceTimerRef.current) {
      clearTimeout(maxPriceTimerRef.current)
    }

    // Debounce the filter update
    maxPriceTimerRef.current = setTimeout(() => {
      onFilterChange({
        ...filters,
        maxPrice: numValue || undefined,
      })
    }, 300)
  }

  const handleClearAll = () => {
    // Clear timers
    if (minPriceTimerRef.current) clearTimeout(minPriceTimerRef.current)
    if (maxPriceTimerRef.current) clearTimeout(maxPriceTimerRef.current)

    // Clear local state
    setLocalMinPrice('')
    setLocalMaxPrice('')

    // Clear all filters
    onFilterChange({})
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters Header */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
              {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
          >
            <X className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={['category', 'price']}
        className="space-y-2"
      >
        {/* Category Filter */}
        <AccordionItem value="category" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pb-2">
              {CATEGORIES.map((category) => {
                const isActive = filters.category === category.value
                return (
                  <div
                    key={category.value}
                    className={cn(
                      'flex items-center space-x-3 p-2 rounded-md transition-colors cursor-pointer',
                      isActive
                        ? 'bg-purple-100'
                        : 'hover:bg-gray-50'
                    )}
                    onClick={() => handleCategoryChange(category.value as ProductCategory, !isActive)}
                  >
                    <Checkbox
                      id={`category-${category.value}`}
                      checked={isActive}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.value as ProductCategory, checked as boolean)
                      }
                      className={cn(
                        'border-2',
                        isActive
                          ? 'bg-purple-600 border-purple-600 text-white data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600'
                          : 'border-gray-300'
                      )}
                    />
                    <Label
                      htmlFor={`category-${category.value}`}
                      className={cn(
                        'text-sm cursor-pointer flex-1',
                        isActive ? 'font-medium text-purple-700' : 'text-gray-700'
                      )}
                    >
                      {category.label}
                    </Label>
                  </div>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-2">
              {/* Price Input Row */}
              <div className="flex items-center gap-3">
                {/* Min Price Input */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Min"
                      value={localMinPrice}
                      onChange={handleMinPriceChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500 text-center">
                    e.g. 6,000
                  </p>
                </div>

                {/* Separator */}
                <span className="text-gray-400 text-sm font-medium pb-5">to</span>

                {/* Max Price Input */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Max"
                      value={localMaxPrice}
                      onChange={handleMaxPriceChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500 text-center">
                    e.g. 11,000
                  </p>
                </div>
              </div>

              {/* Quick Price Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLocalMinPrice('')
                    setLocalMaxPrice(formatNumber(7000))
                    onFilterChange({ ...filters, minPrice: undefined, maxPrice: 7000 })
                  }}
                  className="px-3 py-1.5 text-xs rounded-full border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  Under Rs 7,000
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocalMinPrice(formatNumber(6000))
                    setLocalMaxPrice(formatNumber(11000))
                    onFilterChange({ ...filters, minPrice: 6000, maxPrice: 11000 })
                  }}
                  className="px-3 py-1.5 text-xs rounded-full border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  Rs 6,000 - 11,000
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocalMinPrice(formatNumber(10000))
                    setLocalMaxPrice('')
                    onFilterChange({ ...filters, minPrice: 10000, maxPrice: undefined })
                  }}
                  className="px-3 py-1.5 text-xs rounded-full border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  Over Rs 10,000
                </button>
              </div>
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
                <Badge className="ml-2 bg-purple-600 hover:bg-purple-600">
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
        <div className="sticky top-4">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h2>
          <FilterContent />
        </div>
      </div>
    </>
  )
}

function getActiveFilterCount(filters: ProductFilterState): number {
  let count = 0
  if (filters.category) count++
  if (filters.minPrice !== undefined) count++
  if (filters.maxPrice !== undefined) count++
  return count
}
