'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/config'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, cart, updateQuantity } = useCart()
  const { showToast } = useToast()

  const cartItem = cart.items.find((item) => item.product_id === product.id)
  const quantity = cartItem?.quantity || 0

  const displayPrice = product.sale_price ?? product.price
  const firstImage = product.images?.[0]

  const discountPercent =
    product.sale_price
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : 0

  const isOutOfStock = product.stock_status === 'out_of_stock'

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem({
      product_id: product.id,
      product_name: product.name,
      slug: product.slug,
      unit_label: product.unit_label,
      quantity: 1,
      price: product.price,
      sale_price: product.sale_price,
      image_url: firstImage?.image_url || null,
      stock_status: product.stock_status,
    })
    showToast(`${product.name} added to cart!`, 'success')
  }

  return (
    <article
      className={cn(
        'group bg-white rounded-2xl border border-[#dce8d8] overflow-hidden',
        'hover:shadow-[0_8px_24px_rgba(26,107,58,0.15)] hover:-translate-y-1',
        'transition-all duration-200',
        isOutOfStock && 'opacity-80',
        className
      )}
    >
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#f0f9f4]">
        {firstImage ? (
          <Image
            src={firstImage.image_url}
            alt={firstImage.alt_text || product.name}
            fill
            className={cn(
              'object-cover transition-transform duration-300',
              !isOutOfStock && 'group-hover:scale-105'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f0f9f4]">
            <span className="text-5xl" aria-hidden="true">🛒</span>
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_organic && (
            <Badge variant="organic" className="text-[10px]">Organic</Badge>
          )}
          {product.sale_price && (
            <Badge variant="sale" className="text-[10px]">-{discountPercent}%</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="out-of-stock" className="text-[10px]">Out of Stock</Badge>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-[#1a2517] line-clamp-2 hover:text-[#1a6b3a] transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-[#6b7c69]">{product.unit_label}</p>

        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#1a6b3a]">
            {formatPrice(displayPrice)}
          </span>
          {product.sale_price && (
            <span className="text-sm text-[#6b7c69] line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart / Stepper */}
        <div className="mt-1">
          {isOutOfStock ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full cursor-not-allowed opacity-60 text-xs"
              disabled
            >
              Out of Stock
            </Button>
          ) : quantity > 0 ? (
            <QuantityStepper
              quantity={quantity}
              onIncrement={() => updateQuantity(product.id, quantity + 1)}
              onDecrement={() => updateQuantity(product.id, quantity - 1)}
              size="sm"
              className="w-full justify-between"
            />
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-1.5 h-9 rounded-full bg-[#1a6b3a] text-white text-sm font-semibold hover:bg-[#155530] active:bg-[#0f3d22] transition-colors"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

// Grid skeleton for loading states
export function ProductGrid({ products, loading }: { products?: Product[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#dce8d8] overflow-hidden">
            <div className="aspect-square w-full skeleton" />
            <div className="p-3 space-y-2">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-5 w-1/3 rounded" />
              <div className="skeleton h-9 w-full rounded-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <span className="text-5xl" aria-hidden="true">🌿</span>
        <p className="text-lg font-semibold text-[#1a2517]">No products found</p>
        <p className="text-[#6b7c69] text-sm">Try adjusting your filters or search query.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
