'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCart,
  MessageCircle,
  Share2,
  Check,
  Truck,
  Leaf,
  RotateCcw,
} from 'lucide-react'
import { formatPrice, siteConfig } from '@/lib/config'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { Button } from '@/components/ui/Button'
import { Rating } from '@/components/ui/index'
import type { Product, ProductVariant } from '@/types'

interface ProductDetailViewProps {
  product: Product
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem } = useCart()
  const { showToast } = useToast()

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  )
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'details' | 'delivery'>('desc')
  const [copiedLink, setCopiedLink] = useState(false)

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'fallback', product_id: product.id, image_url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80', alt_text: product.name, sort_order: 1 }]

  const activeImage = images[activeImageIndex] || images[0]

  const currentPrice = selectedVariant
    ? (selectedVariant.sale_price ?? selectedVariant.price)
    : (product.sale_price ?? product.price)

  const originalPrice = selectedVariant
    ? (selectedVariant.sale_price ? selectedVariant.price : null)
    : (product.sale_price ? product.price : null)

  const currentUnitLabel = selectedVariant?.unit_label || product.unit_label

  const isOutOfStock =
    (selectedVariant?.stock_status || product.stock_status) === 'out_of_stock'

  const discountPercent = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem({
      product_id: product.id,
      product_name: product.name,
      slug: product.slug,
      unit_label: currentUnitLabel,
      quantity,
      price: selectedVariant ? selectedVariant.price : product.price,
      sale_price: selectedVariant ? selectedVariant.sale_price : product.sale_price,
      image_url: activeImage.image_url,
      stock_status: product.stock_status,
      variant_id: selectedVariant?.id,
    })
    showToast(`Added ${quantity} × ${product.name} to cart!`, 'success')
  }

  // Single-item direct order on WhatsApp
  const handleSingleItemWhatsApp = () => {
    const itemTotal = currentPrice * quantity
    const message = `*Direct Order Inquiry - ${siteConfig.name}*\n\n` +
      `Product: *${product.name}*\n` +
      `Unit: ${currentUnitLabel}\n` +
      `Quantity: ${quantity}\n` +
      `Price: ${formatPrice(currentPrice)} each\n` +
      `Total: *${formatPrice(itemTotal)}*\n\n` +
      `Please confirm if this is available for delivery to my area!`

    const url = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} at ${siteConfig.name}!`,
          url,
        })
        return
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      showToast('Link copied to clipboard!', 'success')
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      showToast('Could not copy link.', 'error')
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* ─── Left: Image Gallery ────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Main Showcase Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-[#dce8d8] shadow-[0_4px_16px_rgba(26,107,58,0.08)] group">
            <Image
              src={activeImage.image_url}
              alt={activeImage.alt_text || product.name}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_organic && <Badge variant="organic">100% Organic</Badge>}
              {discountPercent > 0 && <Badge variant="sale">-{discountPercent}% OFF</Badge>}
              {isOutOfStock && <Badge variant="out-of-stock">Out of Stock</Badge>}
            </div>

            {/* Share action button */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#1a2517] hover:bg-white shadow-md transition-colors"
              aria-label="Share product"
            >
              {copiedLink ? <Check className="h-5 w-5 text-[#2e7d32]" /> : <Share2 className="h-5 w-5" />}
            </button>
          </div>

          {/* Thumbnails row / Carousel dots for mobile */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#1a6b3a] shadow-md scale-95'
                      : 'border-[#dce8d8] opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || `Product image ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Right: Details & Purchase Options ────────────────────────── */}
        <div className="space-y-6">
          {/* Header & Category */}
          <div>
            {product.category && (
              <Link
                href={`/category/${product.category.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-[#1a6b3a] hover:underline mb-1 inline-block"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading text-[#1a2517] font-bold leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Rating value={4.9} showValue count={28} size="sm" />
              <span className="text-[#dce8d8]">•</span>
              <span className="text-xs text-[#6b7c69]">Farm Direct Quality</span>
            </div>
          </div>

          {/* Price Row */}
          <div className="p-4 bg-white rounded-2xl border border-[#dce8d8] flex items-baseline gap-3">
            <span className="text-3xl font-bold font-heading text-[#1a6b3a]">
              {formatPrice(currentPrice)}
            </span>
            {originalPrice && (
              <span className="text-lg text-[#6b7c69] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-xs font-semibold text-[#6b7c69] ml-auto">
              Price per {currentUnitLabel} (All taxes incl.)
            </span>
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-sm text-[#1a2517] leading-relaxed">
              {product.short_description}
            </p>
          )}

          {/* Variants / Unit Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7c69] mb-2">
                Select Pack / Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id
                  const variantPrice = v.sale_price ?? v.price
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#1a6b3a] bg-[#e8f5ee] shadow-xs'
                          : 'border-[#dce8d8] bg-white hover:border-[#8ccbaa]'
                      }`}
                    >
                      <p className={`text-xs font-semibold ${isSelected ? 'text-[#1a6b3a]' : 'text-[#1a2517]'}`}>
                        {v.unit_label}
                      </p>
                      <p className="text-xs font-bold text-[#1a2517] mt-1">
                        {formatPrice(variantPrice)}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-[#1a2517]">Quantity:</span>
              <QuantityStepper
                quantity={quantity}
                onIncrement={() => setQuantity((q) => q + 1)}
                onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isOutOfStock}
              />
              <span className="text-xs text-[#6b7c69]">
                {isOutOfStock ? (
                  <span className="text-[#c62828] font-bold">Currently Out of Stock</span>
                ) : (
                  <span className="text-[#2e7d32] font-semibold">In Stock &amp; Fresh</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="w-full"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleSingleItemWhatsApp}
                className="w-full"
              >
                <MessageCircle className="h-5 w-5" />
                Order on WhatsApp
              </Button>
            </div>
          </div>

          {/* Trust Row */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#f0f9f4] rounded-2xl border border-[#dce8d8] text-center">
            <div className="flex flex-col items-center gap-1">
              <Leaf className="h-5 w-5 text-[#1a6b3a]" />
              <span className="text-[11px] font-bold text-[#1a2517]">100% Organic</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-5 w-5 text-[#1a6b3a]" />
              <span className="text-[11px] font-bold text-[#1a2517]">Same-Day Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="h-5 w-5 text-[#1a6b3a]" />
              <span className="text-[11px] font-bold text-[#1a2517]">Easy Replacements</span>
            </div>
          </div>

          {/* Tabs / Accordion for Detailed Info */}
          <div className="border border-[#dce8d8] rounded-2xl bg-white overflow-hidden shadow-xs">
            <div className="flex border-b border-[#dce8d8] bg-[#fdfbf5]">
              <button
                onClick={() => setActiveTab('desc')}
                className={`flex-1 py-3 text-xs font-bold tracking-wide transition-colors ${
                  activeTab === 'desc'
                    ? 'border-b-2 border-[#1a6b3a] text-[#1a6b3a] bg-white'
                    : 'text-[#6b7c69] hover:text-[#1a2517]'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 text-xs font-bold tracking-wide transition-colors ${
                  activeTab === 'details'
                    ? 'border-b-2 border-[#1a6b3a] text-[#1a6b3a] bg-white'
                    : 'text-[#6b7c69] hover:text-[#1a2517]'
                }`}
              >
                Storage &amp; Origin
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`flex-1 py-3 text-xs font-bold tracking-wide transition-colors ${
                  activeTab === 'delivery'
                    ? 'border-b-2 border-[#1a6b3a] text-[#1a6b3a] bg-white'
                    : 'text-[#6b7c69] hover:text-[#1a2517]'
                }`}
              >
                Delivery Info
              </button>
            </div>

            <div className="p-5 text-sm text-[#1a2517] leading-relaxed">
              {activeTab === 'desc' && (
                <div className="space-y-3">
                  <p>{product.description || product.short_description || 'Fresh and hand-selected produce guaranteed.'}</p>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {product.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-0.5 rounded-full bg-[#f0f9f4] text-[#1a6b3a] text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#dce8d8]">
                    <span className="text-[#6b7c69]">Origin</span>
                    <span className="font-semibold text-[#1a2517]">Local Organic Farmers (India)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#dce8d8]">
                    <span className="text-[#6b7c69]">Storage</span>
                    <span className="font-semibold text-[#1a2517]">Cool, dry place / Refrigerate after opening</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#dce8d8]">
                    <span className="text-[#6b7c69]">Shelf Life</span>
                    <span className="font-semibold text-[#1a2517]">3 to 7 days from harvest date</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#6b7c69]">Packaging</span>
                    <span className="font-semibold text-[#1a2517]">Eco-friendly recyclable food-grade box</span>
                  </div>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="space-y-2 text-xs">
                  <p>
                    • <strong>Same-Day Delivery:</strong> Available for orders confirmed before 2:00 PM.
                  </p>
                  <p>
                    • <strong>Delivery Fee:</strong> ₹{siteConfig.delivery.deliveryFee} flat rate. Free on orders above ₹{siteConfig.delivery.freeDeliveryThreshold}.
                  </p>
                  <p>
                    • <strong>Payment Mode:</strong> Cash on Delivery (COD) upon receipt of fresh produce.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile Sticky Bottom Bar ───────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#dce8d8] p-3 px-4 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-[#6b7c69]">Total ({quantity} {currentUnitLabel})</p>
          <p className="text-xl font-bold font-heading text-[#1a6b3a]">
            {formatPrice(currentPrice * quantity)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSingleItemWhatsApp}
            aria-label="Order on WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </>
  )
}
