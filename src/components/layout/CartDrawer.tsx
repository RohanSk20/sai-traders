'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice, calculateDeliveryFee, siteConfig } from '@/lib/config'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { Button } from '@/components/ui/Button'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeItem, updateQuantity, itemCount, subtotal } = useCart()

  if (!isOpen) return null

  const deliveryFee = calculateDeliveryFee(subtotal)
  const freeThreshold = siteConfig.delivery.freeDeliveryThreshold
  const amountToFree = Math.max(0, freeThreshold - subtotal)

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping Cart">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-[#dce8d8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#1a6b3a]" />
            <h2 className="font-bold text-lg text-[#1a2517]">Your Cart</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e8f5ee] text-[#1a6b3a]">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Delivery Progress Bar */}
        <div className="bg-[#f0f9f4] px-4 py-3 border-b border-[#dce8d8]">
          {subtotal >= freeThreshold ? (
            <p className="text-xs font-semibold text-[#1a6b3a] flex items-center gap-1.5">
              <span>🎉</span> You unlocked <strong>FREE Same-Day Delivery</strong>!
            </p>
          ) : (
            <div>
              <p className="text-xs text-[#1a2517] mb-1.5">
                Add <strong>{formatPrice(amountToFree)}</strong> more for <strong>FREE Delivery</strong>
              </p>
              <div className="w-full bg-[#dce8d8] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1a6b3a] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#dce8d8]">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#e8f5ee] flex items-center justify-center mb-4 text-3xl">
                🛒
              </div>
              <h3 className="font-bold text-base text-[#1a2517] mb-1">Your cart is empty</h3>
              <p className="text-xs text-[#6b7c69] mb-6 max-w-xs">
                Explore our fresh fruits, vegetables, dairy, and grocery essentials.
              </p>
              <Button onClick={onClose} asChild size="sm">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            cart.items.map((item) => {
              const currentPrice = item.sale_price ?? item.price
              const lineTotal = currentPrice * item.quantity

              return (
                <div key={item.product_id} className="py-4 flex gap-3 items-center">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl bg-[#f0f9f4] overflow-hidden flex-shrink-0 border border-[#dce8d8]">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xl">🌿</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#1a2517] truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-xs text-[#6b7c69] mb-2">{item.unit_label}</p>
                    <div className="flex items-center justify-between">
                      <QuantityStepper
                        size="sm"
                        quantity={item.quantity}
                        onIncrement={() => updateQuantity(item.product_id, item.quantity + 1)}
                        onDecrement={() => updateQuantity(item.product_id, item.quantity - 1)}
                      />
                      <span className="text-sm font-bold text-[#1a6b3a]">
                        {formatPrice(lineTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-[#6b7c69] hover:text-[#c62828] p-1.5 transition-colors"
                    aria-label={`Remove ${item.product_name} from cart`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Totals & Checkout Button */}
        {cart.items.length > 0 && (
          <div className="p-4 border-t border-[#dce8d8] bg-[#fdfbf5] space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#6b7c69]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1a2517]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6b7c69]">
                <span>Estimated Delivery</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-[#2e7d32] font-semibold">FREE</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>
              <div className="border-t border-[#dce8d8] pt-2 flex justify-between text-base font-bold text-[#1a2517]">
                <span>Total Amount</span>
                <span className="text-[#1a6b3a]">{formatPrice(subtotal + deliveryFee)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button asChild variant="outline" size="md" onClick={onClose}>
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button asChild variant="primary" size="md" onClick={onClose}>
                <Link href="/cart">
                  Checkout <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
