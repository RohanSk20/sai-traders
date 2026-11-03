'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Filter, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/FormElements'
import type { Category } from '@/types'

interface ProductFiltersProps {
  categories: Category[]
  selectedCategory?: string
  totalProducts: number
}

export function ProductFilters({
  categories,
  selectedCategory,
  totalProducts,
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Local state for filters
  const currentCategory = selectedCategory || searchParams.get('category') || ''
  const currentOrganic = searchParams.get('organic') === 'true'
  const currentInStock = searchParams.get('in_stock') === 'true'
  const currentSale = searchParams.get('sale') === 'true'
  const currentMinPrice = searchParams.get('min_price') || ''
  const currentMaxPrice = searchParams.get('max_price') || ''
  const currentSort = searchParams.get('sort') || 'relevance'

  const [localCategory, setLocalCategory] = useState(currentCategory)
  const [localOrganic, setLocalOrganic] = useState(currentOrganic)
  const [localInStock, setLocalInStock] = useState(currentInStock)
  const [localSale, setLocalSale] = useState(currentSale)
  const [localMinPrice, setLocalMinPrice] = useState(currentMinPrice)
  const [localMaxPrice, setLocalMaxPrice] = useState(currentMaxPrice)

  const activeFilterCount =
    (localCategory && !selectedCategory ? 1 : 0) +
    (localOrganic ? 1 : 0) +
    (localInStock ? 1 : 0) +
    (localSale ? 1 : 0) +
    (localMinPrice || localMaxPrice ? 1 : 0)

  const applyFilters = (overrides?: {
    category?: string
    organic?: boolean
    inStock?: boolean
    sale?: boolean
    minPrice?: string
    maxPrice?: string
    sort?: string
  }) => {
    const params = new URLSearchParams(searchParams.toString())

    const cat = overrides?.category !== undefined ? overrides.category : localCategory
    const org = overrides?.organic !== undefined ? overrides.organic : localOrganic
    const stkW = overrides?.inStock !== undefined ? overrides.inStock : localInStock
    const sal = overrides?.sale !== undefined ? overrides.sale : localSale
    const minP = overrides?.minPrice !== undefined ? overrides.minPrice : localMinPrice
    const maxP = overrides?.maxPrice !== undefined ? overrides.maxPrice : localMaxPrice
    const srt = overrides?.sort !== undefined ? overrides.sort : currentSort

    if (cat && !selectedCategory) params.set('category', cat)
    else if (!selectedCategory) params.delete('category')

    if (org) params.set('organic', 'true')
    else params.delete('organic')

    if (stkW) params.set('in_stock', 'true')
    else params.delete('in_stock')

    if (sal) params.set('sale', 'true')
    else params.delete('sale')

    if (minP) params.set('min_price', minP)
    else params.delete('min_price')

    if (maxP) params.set('max_price', maxP)
    else params.delete('max_price')

    if (srt && srt !== 'relevance') params.set('sort', srt)
    else params.delete('sort')

    params.delete('page') // Reset page on filter change

    router.push(`${pathname}?${params.toString()}`)
    setMobileDrawerOpen(false)
  }

  const clearAllFilters = () => {
    setLocalCategory(selectedCategory || '')
    setLocalOrganic(false)
    setLocalInStock(false)
    setLocalSale(false)
    setLocalMinPrice('')
    setLocalMaxPrice('')

    const params = new URLSearchParams()
    if (currentSort && currentSort !== 'relevance') params.set('sort', currentSort)
    router.push(`${pathname}?${params.toString()}`)
    setMobileDrawerOpen(false)
  }

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newSort !== 'relevance') {
      params.set('sort', newSort)
    } else {
      params.delete('sort')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const FilterContent = (
    <div className="space-y-6">
      {/* Category Filter (if not already on /category/[slug]) */}
      {!selectedCategory && categories.length > 0 && (
        <div className="border-b border-[#dce8d8] pb-6">
          <h4 className="font-semibold text-sm text-[#1a2517] mb-3">Category</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="category-filter"
                checked={localCategory === ''}
                onChange={() => {
                  setLocalCategory('')
                  applyFilters({ category: '' })
                }}
                className="text-[#1a6b3a] focus:ring-[#1a6b3a]"
              />
              <span className={localCategory === '' ? 'font-semibold text-[#1a6b3a]' : 'text-[#1a2517]'}>
                All Categories
              </span>
            </label>
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="category-filter"
                  checked={localCategory === c.slug}
                  onChange={() => {
                    setLocalCategory(c.slug)
                    applyFilters({ category: c.slug })
                  }}
                  className="text-[#1a6b3a] focus:ring-[#1a6b3a]"
                />
                <span className={localCategory === c.slug ? 'font-semibold text-[#1a6b3a]' : 'text-[#1a2517]'}>
                  {c.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Special Highlights */}
      <div className="border-b border-[#dce8d8] pb-6">
        <h4 className="font-semibold text-sm text-[#1a2517] mb-3">Preferences</h4>
        <div className="space-y-3">
          <Checkbox
            label="🌿 100% Organic Only"
            checked={localOrganic}
            onChange={(e) => {
              setLocalOrganic(e.target.checked)
              applyFilters({ organic: e.target.checked })
            }}
          />
          <Checkbox
            label="✓ In Stock Only"
            checked={localInStock}
            onChange={(e) => {
              setLocalInStock(e.target.checked)
              applyFilters({ inStock: e.target.checked })
            }}
          />
          <Checkbox
            label="🏷️ On Sale / Discounted"
            checked={localSale}
            onChange={(e) => {
              setLocalSale(e.target.checked)
              applyFilters({ sale: e.target.checked })
            }}
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="border-b border-[#dce8d8] pb-6">
        <h4 className="font-semibold text-sm text-[#1a2517] mb-3">Price Range (₹)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-[#dce8d8] text-sm bg-white"
          />
          <span className="text-[#6b7c69]">-</span>
          <input
            type="number"
            placeholder="Max"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-[#dce8d8] text-sm bg-white"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 text-xs"
          onClick={() => applyFilters()}
        >
          Apply Price
        </Button>
      </div>

      {/* Clear Button */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[#c62828] hover:underline py-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Top Bar for Sort + Mobile Filter Trigger */}
      <div className="flex items-center justify-between pb-6 border-b border-[#dce8d8] mb-6 flex-wrap gap-4">
        <div className="text-sm text-[#6b7c69]">
          Showing <span className="font-semibold text-[#1a2517]">{totalProducts}</span> products
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-[#dce8d8] bg-white text-sm font-semibold text-[#1a2517] hover:bg-[#f0f9f4]"
            aria-label="Open filters"
          >
            <Filter className="h-4 w-4 text-[#1a6b3a]" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#1a6b3a] text-white text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#6b7c69] hidden sm:inline">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#dce8d8] bg-white text-sm text-[#1a2517] focus:outline-none focus:ring-2 focus:ring-[#1a6b3a]"
            >
              <option value="relevance">Featured &amp; Relevant</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (Rendered inside grid container by parent) */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 bg-white p-6 rounded-2xl border border-[#dce8d8] shadow-[0_2px_8px_rgba(26,107,58,0.06)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#dce8d8]">
            <h3 className="font-bold text-base text-[#1a2517] flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#1a6b3a]" /> Filters
            </h3>
            {activeFilterCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e8f5ee] text-[#1a6b3a]">
                {activeFilterCount} Active
              </span>
            )}
          </div>
          {FilterContent}
        </div>
      </aside>

      {/* Mobile Bottom-sheet / Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 border-b border-[#dce8d8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#1a6b3a]" />
                <h3 className="font-bold text-lg text-[#1a2517]">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e8f5ee] text-[#1a6b3a]">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1">{FilterContent}</div>

            {/* Footer actions */}
            <div className="p-4 border-t border-[#dce8d8] flex items-center gap-3 bg-white">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => applyFilters()}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
