'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Download,
  Upload,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/FormElements'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/config'
import { mockCategories, mockProducts } from '@/lib/mockData'
import { uploadProductImage } from '@/lib/storage'
import type { Product, Category, ProductImage } from '@/types'

export default function AdminProductsPage() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [categories, setCategories] = useState<Category[]>(mockCategories)

  // Fetch live products and categories from backend API
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && data.products.length > 0) {
          setProducts(data.products)
        }
      })
      .catch((err) => console.warn('Failed to load products from API:', err))

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data?.categories && data.categories.length > 0) {
          setCategories(data.categories)
        }
      })
      .catch((err) => console.warn('Failed to load categories from API:', err))
  }, [])

  // Filters & Search
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all')

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [csvModalOpen, setCsvModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)

  // Quick Category creation
  const [quickCatOpen, setQuickCatOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  // Product Image Upload
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [manualImageUrl, setManualImageUrl] = useState('')

  // CSV Import State
  const [csvText, setCsvText] = useState('')
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [csvSuccessCount, setCsvSuccessCount] = useState<number | null>(null)

  // Quick Category Creation Handler
  const handleQuickCreateCategory = async () => {
    if (!newCatName.trim()) return
    const name = newCatName.trim()
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const newCat: Partial<Category> = {
      name,
      slug,
      description: `Premium quality ${name} sourced for domestic and global export orders.`,
      image_url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80',
      sort_order: categories.length + 1,
      is_active: true,
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      })
      const data = await res.json()
      if (data.success && data.category) {
        setCategories((prev) => [...prev, data.category])
        setEditingProduct((prev) => (prev ? { ...prev, category_id: data.category.id } : null))
        setNewCatName('')
        setQuickCatOpen(false)
        showToast(`Category "${data.category.name}" created and selected!`, 'success')
      }
    } catch {
      showToast('Failed to create category', 'error')
    }
  }


  // Multi-image file upload handler
  const handleImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsUploadingImage(true)
    try {
      const uploadedImages: ProductImage[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const { url, error } = await uploadProductImage(file)
        if (error) {
          showToast(`Failed to upload ${file.name}: ${error}`, 'error')
        } else if (url) {
          uploadedImages.push({
            id: `img-${Date.now()}-${i}`,
            product_id: editingProduct?.id || '',
            image_url: url,
            alt_text: editingProduct?.name || file.name.replace(/\.[^/.]+$/, ''),
            sort_order: (editingProduct?.images?.length || 0) + i + 1,
          })
        }
      }
      if (uploadedImages.length > 0) {
        setEditingProduct((prev) => {
          if (!prev) return null
          return {
            ...prev,
            images: [...(prev.images || []), ...uploadedImages],
          }
        })
        showToast(`Uploaded ${uploadedImages.length} image(s)!`, 'success')
      }
    } catch {
      showToast('Failed to upload image', 'error')
    } finally {
      setIsUploadingImage(false)
      e.target.value = ''
    }
  }

  // Add Manual Image URL
  const handleAddImageUrl = () => {
    if (!manualImageUrl.trim()) return
    setEditingProduct((prev) => {
      if (!prev) return null
      return {
        ...prev,
        images: [
          ...(prev.images || []),
          {
            id: `img-${Date.now()}`,
            product_id: prev.id || '',
            image_url: manualImageUrl.trim(),
            alt_text: prev.name || 'Product Image',
            sort_order: (prev.images?.length || 0) + 1,
          },
        ],
      }
    })
    setManualImageUrl('')
    showToast('Image URL added', 'success')
  }

  // Remove image
  const handleRemoveImage = (indexToRemove: number) => {
    setEditingProduct((prev) => {
      if (!prev || !prev.images) return prev
      return {
        ...prev,
        images: prev.images.filter((_, idx) => idx !== indexToRemove),
      }
    })
  }

  // Set as Cover
  const handleSetCoverImage = (indexToCover: number) => {
    setEditingProduct((prev) => {
      if (!prev || !prev.images) return prev
      const images = [...prev.images]
      const [selected] = images.splice(indexToCover, 1)
      images.unshift(selected)
      return {
        ...prev,
        images,
      }
    })
    showToast('Set as main cover image', 'info')
  }

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())

      const matchCat = !selectedCat || p.category_id === selectedCat

      const matchStock =
        stockFilter === 'all' || p.stock_status === stockFilter

      return matchSearch && matchCat && matchStock
    })
  }, [products, search, selectedCat, stockFilter])

  // Quick inline toggle for stock status
  const handleToggleStock = async (id: string) => {
    const prod = products.find((p) => p.id === id)
    if (!prod) return
    const nextStatus = prod.stock_status === 'in_stock' ? 'out_of_stock' : 'in_stock'

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock_status: nextStatus } : p))
    )

    try {
      await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stock_status: nextStatus }),
      })
      showToast(
        `${prod.name} marked ${nextStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}`,
        nextStatus === 'in_stock' ? 'success' : 'warning'
      )
    } catch {
      showToast('Failed to update stock status on server', 'error')
    }
  }

  // Toggle active
  const handleToggleActive = async (id: string) => {
    const prod = products.find((p) => p.id === id)
    if (!prod) return
    const nextActive = !prod.is_active

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: nextActive } : p))
    )

    try {
      await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: nextActive }),
      })
      showToast('Updated active status', 'info')
    } catch {
      showToast('Failed to update active status on server', 'error')
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
      try {
        await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
        showToast('Product deleted from storefront', 'info')
      } catch {
        showToast('Failed to delete product on server', 'error')
      }
    }
  }

  // Open Add Product Form
  const handleOpenAdd = () => {
    setEditingProduct({
      name: '',
      slug: '',
      category_id: categories[0]?.id || 'cat-1',
      short_description: '',
      description: '',
      price: 100,
      sale_price: null,
      unit_label: '1 kg',
      stock_status: 'in_stock',
      is_organic: true,
      is_featured: false,
      is_active: true,
      tags: ['fresh'],
      images: [
        {
          id: `img-${Date.now()}`,
          product_id: '',
          image_url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
          alt_text: 'Product showcase',
          sort_order: 1,
        },
      ],
    })
    setFormModalOpen(true)
  }

  // Open Edit Product Form
  const handleOpenEdit = (product: Product) => {
    setEditingProduct({ ...product })
    setFormModalOpen(true)
  }

  // Save product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct?.name || !editingProduct.price) return

    // Price validation
    if (editingProduct.sale_price && editingProduct.sale_price >= editingProduct.price) {
      showToast('Sale price must be strictly less than the regular price', 'error')
      return
    }

    const slug =
      editingProduct.slug ||
      editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const payload: Partial<Product> = {
      ...editingProduct,
      slug,
      price: Number(editingProduct.price),
      sale_price: editingProduct.sale_price ? Number(editingProduct.sale_price) : null,
      unit_label: editingProduct.unit_label || '1 kg',
      stock_status: editingProduct.stock_status || 'in_stock',
      is_organic: editingProduct.is_organic ?? false,
      is_featured: editingProduct.is_featured ?? false,
      is_active: editingProduct.is_active ?? true,
      tags: editingProduct.tags || ['fresh'],
      images: editingProduct.images || [],
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success && data.product) {
        setProducts((prev) => {
          const exists = prev.some((p) => p.id === data.product.id)
          if (exists) {
            return prev.map((p) => (p.id === data.product.id ? data.product : p))
          }
          return [data.product, ...prev]
        })
        showToast(
          editingProduct.id
            ? 'Product updated & live on storefront!'
            : 'New product added & live on storefront!',
          'success'
        )
      } else {
        throw new Error(data.error || 'Failed to save product')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product'
      showToast(msg, 'error')
    }

    setFormModalOpen(false)
  }

  // CSV Template Download
  const handleDownloadCsvTemplate = () => {
    const headers = 'name,category,price,sale_price,unit,description,image_url\n'
    const sample = 'Himachal Golden Apples,Fruits,220,199,1 kg,"Sweet crisp golden apples",https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6\n'
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sai_traders_product_template.csv'
    a.click()
  }

  // Process CSV Upload
  const handleProcessCsv = () => {
    setCsvErrors([])
    setCsvSuccessCount(null)

    if (!csvText.trim()) {
      setCsvErrors(['Please paste or upload CSV data'])
      return
    }

    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      setCsvErrors(['CSV file must have at least a header row and one product row'])
      return
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const errors: string[] = []
    const importedProducts: Product[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Basic comma parsing
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
      const rowNum = i + 1

      const name = values[headers.indexOf('name')]
      const categoryName = values[headers.indexOf('category')]
      const priceStr = values[headers.indexOf('price')]
      const salePriceStr = values[headers.indexOf('sale_price')]
      const unit = values[headers.indexOf('unit')] || '1 kg'
      const desc = values[headers.indexOf('description')] || ''
      const imgUrl = values[headers.indexOf('image_url')] || ''

      if (!name) {
        errors.push(`Row ${rowNum}: Name is required`)
        continue
      }

      const price = parseFloat(priceStr)
      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${rowNum}: Invalid price "${priceStr}"`)
        continue
      }

      let salePrice: number | null = null
      if (salePriceStr) {
        salePrice = parseFloat(salePriceStr)
        if (isNaN(salePrice) || salePrice >= price) {
          errors.push(`Row ${rowNum}: Sale price must be a valid number less than regular price`)
          continue
        }
      }

      // Match category
      const matchedCat = categories.find(
        (c) => c.name.toLowerCase() === (categoryName || '').toLowerCase()
      )
      const category_id = matchedCat?.id || categories[0]?.id || 'cat-1'

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      importedProducts.push({
        id: `prod-csv-${Date.now()}-${i}`,
        name,
        slug,
        category_id,
        short_description: desc.slice(0, 120),
        description: desc,
        price,
        sale_price: salePrice,
        unit_label: unit,
        stock_status: 'in_stock',
        is_organic: false,
        is_featured: false,
        is_active: true,
        tags: ['imported'],
        seo_title: `${name} | Sai Traders`,
        seo_description: desc,
        created_at: new Date().toISOString(),
        images: imgUrl
          ? [{ id: `img-${i}`, product_id: '', image_url: imgUrl, alt_text: name, sort_order: 1 }]
          : [],
      })
    }

    if (errors.length > 0) {
      setCsvErrors(errors)
    }

    if (importedProducts.length > 0) {
      setProducts((prev) => [...importedProducts, ...prev])
      setCsvSuccessCount(importedProducts.length)
      showToast(`Imported ${importedProducts.length} products!`, 'success')
      if (errors.length === 0) {
        setTimeout(() => setCsvModalOpen(false), 1500)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#1a2517]">
            Product Inventory
          </h1>
          <p className="text-xs text-[#6b7c69]">
            Manage {products.length} products with live price, stock toggles, and bulk CSV import
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCsvModalOpen(true)}
          >
            <FileSpreadsheet className="h-4 w-4" /> CSV Import
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#dce8d8] shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[220px] max-w-sm relative">
          <input
            type="search"
            placeholder="Search products by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-[#dce8d8] text-xs bg-[#fdfbf5] focus:outline-none focus:ring-2 focus:ring-[#1a6b3a]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7c69]" />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#dce8d8] text-xs bg-white text-[#1a2517]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as 'all' | 'in_stock' | 'out_of_stock')}
            className="px-3 py-1.5 rounded-xl border border-[#dce8d8] text-xs bg-white text-[#1a2517]"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>

          <span className="text-xs text-[#6b7c69]">
            Showing <strong>{filteredProducts.length}</strong> of {products.length}
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#dce8d8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fdfbf5] text-xs font-bold text-[#6b7c69] uppercase tracking-wider border-b border-[#dce8d8]">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Status (Quick Toggle)</th>
                <th className="px-6 py-4">Badges</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dce8d8]">
              {filteredProducts.map((p) => {
                const category = categories.find((c) => c.id === p.category_id)
                const firstImg = p.images?.[0]
                const isInStock = p.stock_status === 'in_stock'

                return (
                  <tr key={p.id} className="hover:bg-[#f0f9f4]/40 transition-colors">
                    {/* Product Name & Image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#e8f5ee] border border-[#dce8d8] flex-shrink-0">
                          {firstImg?.image_url ? (
                            <Image
                              src={firstImg.image_url}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-lg">🌿</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a2517]">{p.name}</p>
                          <p className="text-xs text-[#6b7c69]">{p.unit_label}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-xs font-semibold text-[#1a2517]">
                      {category?.name || '—'}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#1a6b3a]">
                          {formatPrice(p.sale_price ?? p.price)}
                        </span>
                        {p.sale_price && (
                          <span className="text-xs text-[#6b7c69] line-through">
                            {formatPrice(p.price)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Inline Stock Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStock(p.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isInStock
                            ? 'bg-[#e8f5ee] text-[#2e7d32] border border-[#8ccbaa] hover:bg-[#c8e6c9]'
                            : 'bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] hover:bg-[#ffcdd2]'
                        }`}
                        title="Click to toggle in-stock / out-of-stock"
                      >
                        <span className={`w-2 h-2 rounded-full ${isInStock ? 'bg-[#2e7d32]' : 'bg-[#c62828]'}`} />
                        {isInStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>

                    {/* Organic / Featured Badges */}
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {p.is_organic && <Badge variant="organic" className="text-[10px]">Organic</Badge>}
                        {p.is_featured && <Badge variant="featured" className="text-[10px]">Featured</Badge>}
                      </div>
                    </td>

                    {/* Active toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(p.id)}
                        className="cursor-pointer"
                      >
                        <Badge variant={p.is_active ? 'success' : 'out-of-stock'}>
                          {p.is_active ? 'Live' : 'Hidden'}
                        </Badge>
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 rounded-lg bg-[#e8f5ee] text-[#1a6b3a] hover:bg-[#1a6b3a] hover:text-white transition-colors"
                          aria-label="Edit product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 rounded-lg bg-[#ffebee] text-[#c62828] hover:bg-[#c62828] hover:text-white transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add / Edit Product Modal ─────────────────────────────────── */}
      {formModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#dce8d8] max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#dce8d8]">
              <h2 className="text-xl font-bold font-heading text-[#1a2517]">
                {editingProduct.id ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setFormModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <Input
                label="Product Name"
                placeholder="e.g. Alphonso Mangoes"
                value={editingProduct.name || ''}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                  })
                }
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="URL Slug"
                  value={editingProduct.slug || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, slug: e.target.value })
                  }
                  required
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-[#1a2517]">
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setQuickCatOpen((v) => !v)}
                      className="text-xs font-bold text-[#1a6b3a] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> {quickCatOpen ? 'Cancel' : '+ New Category'}
                    </button>
                  </div>

                  {quickCatOpen && (
                    <div className="p-3 bg-[#e8f5ee]/80 border border-[#8ccbaa] rounded-2xl flex items-center gap-2 mb-2 animate-in fade-in-50 duration-150">
                      <input
                        type="text"
                        placeholder="New category name (e.g. Export Spices)..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="flex-1 text-xs px-3 py-1.5 bg-white border border-[#dce8d8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a6b3a]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleQuickCreateCategory()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={handleQuickCreateCategory}
                        disabled={!newCatName.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  )}

                  <Select
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    value={editingProduct.category_id}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category_id: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Regular Price (₹)"
                  type="number"
                  placeholder="e.g. 299"
                  value={editingProduct.price || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })
                  }
                  required
                />

                <Input
                  label="Sale Price (₹) (Optional)"
                  type="number"
                  placeholder="e.g. 249"
                  value={editingProduct.sale_price || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      sale_price: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  hint="Must be less than regular price"
                />

                <Input
                  label="Unit Label"
                  placeholder="e.g. 1 kg / 500 g"
                  value={editingProduct.unit_label || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, unit_label: e.target.value })
                  }
                  required
                />
              </div>

              <Input
                label="Short Description"
                placeholder="Catchy 1-line summary..."
                value={editingProduct.short_description || ''}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, short_description: e.target.value })
                }
              />

              <Textarea
                label="Detailed Description"
                placeholder="Origin, farming practices, health perks, export specifications..."
                value={editingProduct.description || ''}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, description: e.target.value })
                }
                rows={3}
              />

              {/* Product Images: File Upload & Gallery */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-[#1a2517]">
                    Product Images ({editingProduct.images?.length || 0})
                  </label>
                  <span className="text-xs text-[#6b7c69]">Cover image is shown first in catalog</span>
                </div>

                {/* Uploaded Images Preview Cards */}
                {editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {editingProduct.images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="group relative border border-[#dce8d8] rounded-2xl overflow-hidden bg-[#fdfbf5] shadow-xs p-1.5 flex flex-col justify-between"
                      >
                        <div className="relative w-full h-24 rounded-xl overflow-hidden bg-black/5">
                          <Image
                            src={img.image_url}
                            alt={img.alt_text || 'Product image'}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#1a6b3a] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                            title="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetCoverImage(idx)}
                            className="mt-1 text-[11px] text-[#1a6b3a] font-semibold hover:underline text-center cursor-pointer"
                          >
                            Set as Cover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area & Direct URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Dropzone / Button */}
                  <label className="border-2 border-dashed border-[#8ccbaa] bg-[#f0f9f4] hover:bg-[#e8f5ee] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageFilesUpload}
                      disabled={isUploadingImage}
                    />
                    {isUploadingImage ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#1a6b3a]">
                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading image(s)...
                      </div>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-[#1a6b3a] mb-1" />
                        <p className="text-xs font-bold text-[#1a6b3a]">Upload Product Images</p>
                        <p className="text-[10px] text-[#6b7c69]">Click to select from device (multi-image supported)</p>
                      </>
                    )}
                  </label>

                  {/* Manual URL Input */}
                  <div className="flex flex-col justify-center space-y-1.5 bg-[#fdfbf5] border border-[#dce8d8] rounded-2xl p-3">
                    <label className="text-xs font-semibold text-[#1a2517]">Or Paste Image URL</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-[#dce8d8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1a6b3a]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddImageUrl}
                        disabled={!manualImageUrl.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={editingProduct.stock_status === 'in_stock'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock_status: e.target.checked ? 'in_stock' : 'out_of_stock',
                      })
                    }
                    className="rounded text-[#1a6b3a]"
                  />
                  <span>In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_organic ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_organic: e.target.checked })
                    }
                    className="rounded text-[#1a6b3a]"
                  />
                  <span>100% Organic</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_featured: e.target.checked })
                    }
                    className="rounded text-[#1a6b3a]"
                  />
                  <span>Featured Item</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active ?? true}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_active: e.target.checked })
                    }
                    className="rounded text-[#1a6b3a]"
                  />
                  <span>Active (Live)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#dce8d8]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CSV Import Modal ─────────────────────────────────────────── */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#dce8d8] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#dce8d8]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-[#1a6b3a]" />
                <h2 className="text-xl font-bold font-heading text-[#1a2517]">
                  Bulk CSV Import
                </h2>
              </div>
              <button
                onClick={() => setCsvModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-[#f0f9f4] p-3 rounded-2xl border border-[#dce8d8]">
              <p className="text-xs text-[#1a2517]">
                Need the standard spreadsheet format?
              </p>
              <button
                onClick={handleDownloadCsvTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-xs font-bold text-[#1a6b3a] border border-[#dce8d8] hover:bg-[#e8f5ee] transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download Template
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a2517] mb-1.5">
                Paste CSV Data (name, category, price, sale_price, unit, description, image_url)
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`name,category,price,sale_price,unit,description,image_url\nAlphonso Mango,Fruits,450,399,1 dozen,"Fresh Ratnagiri mangoes",https://...`}
                rows={7}
                className="w-full font-mono text-xs p-3 rounded-xl border border-[#dce8d8] bg-[#fdfbf5] focus:ring-2 focus:ring-[#1a6b3a]"
              />
            </div>

            {/* Error reports */}
            {csvErrors.length > 0 && (
              <div className="bg-[#ffebee] border border-[#ffcdd2] p-3 rounded-2xl space-y-1 text-xs text-[#c62828] max-h-32 overflow-y-auto">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Validation Errors:
                </p>
                {csvErrors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            {/* Success feedback */}
            {csvSuccessCount !== null && (
              <div className="bg-[#e8f5ee] border border-[#8ccbaa] p-3 rounded-2xl text-xs text-[#2e7d32] font-bold">
                ✓ Successfully imported {csvSuccessCount} products!
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-[#dce8d8]">
              <Button
                variant="outline"
                onClick={() => setCsvModalOpen(false)}
              >
                Close
              </Button>
              <Button variant="primary" onClick={handleProcessCsv}>
                <Upload className="h-4 w-4" /> Validate &amp; Import Rows
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
