'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/FormElements'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { mockCategories } from '@/lib/mockData'
import { uploadCategoryImage } from '@/lib/storage'
import type { Category } from '@/types'

export default function AdminCategoriesPage() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch live categories from backend API on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data?.categories && data.categories.length > 0) {
          setCategories(data.categories)
        }
      })
      .catch((err) => console.warn('Failed to load categories:', err))
  }, [])

  const handleOpenAdd = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      sort_order: categories.length + 1,
      is_active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingCategory({ ...category })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? Products linked to it should be updated first.')) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      try {
        await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
        showToast('Category deleted from storefront', 'info')
      } catch {
        showToast('Failed to delete category on server', 'error')
      }
    }
  }

  const handleToggleActive = async (id: string) => {
    const target = categories.find((c) => c.id === id)
    if (!target) return
    const nextActive = !target.is_active

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: nextActive } : c))
    )

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...target, is_active: nextActive }),
      })
      showToast('Updated status', 'success')
    } catch {
      showToast('Failed to update status on server', 'error')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const { url, error } = await uploadCategoryImage(file)
      if (error) {
        showToast(`Failed to upload category image: ${error}`, 'error')
      } else if (url) {
        setEditingCategory((prev) => (prev ? { ...prev, image_url: url } : null))
        showToast('Category image uploaded successfully!', 'success')
      }
    } catch {
      showToast('Error uploading category image', 'error')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory?.name) return

    const slug =
      editingCategory.slug ||
      editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const payload: Partial<Category> = {
      ...editingCategory,
      slug,
      sort_order: editingCategory.sort_order ?? categories.length + 1,
      is_active: editingCategory.is_active ?? true,
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success && data.category) {
        setCategories((prev) => {
          const exists = prev.some((c) => c.id === data.category.id)
          if (exists) {
            return prev.map((c) => (c.id === data.category.id ? data.category : c))
          }
          return [...prev, data.category]
        })
        showToast(editingCategory.id ? 'Category updated!' : 'New category created & live!', 'success')
      } else {
        throw new Error(data.error || 'Failed to save category')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving category'
      showToast(msg, 'error')
    }

    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#1a2517]">
            Category Management
          </h1>
          <p className="text-xs text-[#6b7c69]">
            Add, reorder, edit, and curate store departments
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4" /> Add New Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-[#dce8d8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fdfbf5] text-xs font-bold text-[#6b7c69] uppercase tracking-wider border-b border-[#dce8d8]">
              <tr>
                <th className="px-6 py-4">Sort</th>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name &amp; Slug</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dce8d8]">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-[#f0f9f4]/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-[#6b7c69]">
                    #{category.sort_order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#e8f5ee] border border-[#dce8d8]">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-lg">🛒</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#1a2517]">{category.name}</p>
                    <p className="font-mono text-xs text-[#6b7c69]">/{category.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#6b7c69] max-w-xs truncate">
                    {category.description || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(category.id)}
                      className="cursor-pointer"
                    >
                      <Badge variant={category.is_active ? 'success' : 'out-of-stock'}>
                        {category.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(category)}
                        className="p-2 rounded-lg bg-[#e8f5ee] text-[#1a6b3a] hover:bg-[#1a6b3a] hover:text-white transition-colors"
                        aria-label="Edit category"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 rounded-lg bg-[#ffebee] text-[#c62828] hover:bg-[#c62828] hover:text-white transition-colors"
                        aria-label="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#dce8d8] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#dce8d8]">
              <h2 className="text-xl font-bold font-heading text-[#1a2517]">
                {editingCategory.id ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Category Name"
                placeholder="e.g. Organic Dairy & Eggs"
                value={editingCategory.name || ''}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                  })
                }
                required
              />

              <Input
                label="URL Slug"
                placeholder="e.g. organic-dairy"
                value={editingCategory.slug || ''}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, slug: e.target.value })
                }
                hint="Used in web address: /category/[slug]"
                required
              />

              <Textarea
                label="Category Description"
                placeholder="Short description highlighting the health benefits and freshness..."
                value={editingCategory.description || ''}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, description: e.target.value })
                }
                rows={3}
              />

              {/* Category Image Upload & Preview */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#1a2517]">
                  Category Banner Image
                </label>

                {editingCategory.image_url && (
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-[#dce8d8] bg-[#fdfbf5]">
                    <Image
                      src={editingCategory.image_url}
                      alt={editingCategory.name || 'Category'}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingCategory((prev) => (prev ? { ...prev, image_url: '' } : null))
                      }
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="border-2 border-dashed border-[#8ccbaa] bg-[#f0f9f4] hover:bg-[#e8f5ee] rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1a6b3a]">
                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading image...
                      </div>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 text-[#1a6b3a] mb-1" />
                        <span className="text-xs font-bold text-[#1a6b3a]">Upload Image</span>
                        <span className="text-[10px] text-[#6b7c69]">JPG, PNG, WebP</span>
                      </>
                    )}
                  </label>

                  <div>
                    <Input
                      placeholder="Or paste image URL: https://..."
                      value={editingCategory.image_url || ''}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, image_url: e.target.value })
                      }
                      hint="Direct web link"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Sort Order"
                  type="number"
                  value={editingCategory.sort_order ?? 1}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      sort_order: parseInt(e.target.value, 10),
                    })
                  }
                />

                <div className="flex flex-col justify-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={editingCategory.is_active ?? true}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          is_active: e.target.checked,
                        })
                      }
                      className="rounded border-[#dce8d8] text-[#1a6b3a] focus:ring-[#1a6b3a]"
                    />
                    <span className="font-semibold text-[#1a2517]">Active in Store</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#dce8d8]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
