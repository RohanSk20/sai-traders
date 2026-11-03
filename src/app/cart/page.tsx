'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Trash2,
  ArrowRight,
  MessageCircle,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Globe2,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/FormElements'
import { Breadcrumbs } from '@/components/ui/index'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import {
  siteConfig,
  formatPrice,
  calculateDeliveryFee,
  isServiceablePincode,
  isSameDayAvailable,
} from '@/lib/config'
import type { Order } from '@/types'

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart, itemCount, subtotal } = useCart()
  const { showToast } = useToast()

  // Order Mode: 'domestic' (Pan-India) or 'export' (International)
  const [orderType, setOrderType] = useState<'domestic' | 'export'>('domestic')

  // Form Fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [landmark, setLandmark] = useState('')
  const [destinationCountry, setDestinationCountry] = useState('AE')
  const [exportPort, setExportPort] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  // Slot options for Domestic
  const sameDay = isSameDayAvailable()
  const slotOptions = [
    ...(sameDay
      ? [
          { value: 'Today: 4:00 PM – 7:00 PM', label: 'Local Express: Today Evening (4:00 PM – 7:00 PM)' },
          { value: 'Today: 7:00 PM – 9:00 PM', label: 'Local Express: Today Night (7:00 PM – 9:00 PM)' },
        ]
      : []),
    { value: 'Tomorrow: 8:00 AM – 11:00 AM', label: 'Next-Day: Morning (8:00 AM – 11:00 AM)' },
    { value: 'Tomorrow: 4:00 PM – 7:00 PM', label: 'Next-Day: Evening (4:00 PM – 7:00 PM)' },
    { value: 'Standard Domestic (2-4 Days)', label: 'Pan-India Standard Shipping (2–4 Days)' },
  ]

  const [deliverySlot, setDeliverySlot] = useState(
    slotOptions[0]?.value || 'Tomorrow: 8:00 AM – 11:00 AM'
  )

  // Form Validation & Submitting
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)

  const deliveryFee = orderType === 'domestic' ? calculateDeliveryFee(subtotal) : 0
  const grandTotal = subtotal + deliveryFee
  const freeThreshold = siteConfig.delivery.freeDeliveryThreshold
  const amountToFree = Math.max(0, freeThreshold - subtotal)

  // Validate fields
  const validateForm = () => {
    const errs: Record<string, string> = {}

    if (!name.trim()) errs.name = 'Please enter your full name / company name'

    if (orderType === 'domestic') {
      const cleanPhone = phone.trim().replace(/\D/g, '')
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        errs.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'
      }

      const cleanPin = pincode.trim()
      if (!/^\d{6}$/.test(cleanPin) || !isServiceablePincode(cleanPin)) {
        errs.pincode = 'Please enter a valid 6-digit Indian PIN code'
      }

      if (!address.trim()) errs.address = 'Please enter your complete delivery address'
      if (!deliverySlot) errs.slot = 'Please select a delivery slot'
    } else {
      // International Export Validation
      if (!phone.trim()) {
        errs.phone = 'Please enter your phone number with country code (e.g. +971 50 123 4567)'
      }
      if (!address.trim()) errs.address = 'Please enter destination address / port / city'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Order on WhatsApp
  const handleOrderOnWhatsApp = async () => {
    if (!validateForm()) {
      showToast('Please correct the highlighted form fields', 'error')
      return
    }

    if (cart.items.length === 0) {
      showToast('Your cart is empty', 'error')
      return
    }

    setIsSubmitting(true)

    const countryObj = siteConfig.delivery.exportDestinations.find((c) => c.code === destinationCountry)
    const countryName = countryObj?.name || destinationCountry

    const orderPayload = {
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      delivery_address: orderType === 'domestic' ? address.trim() : `${address.trim()} [Country: ${countryName}]`,
      pincode: orderType === 'domestic' ? pincode.trim() : 'INTL',
      landmark: orderType === 'domestic' ? landmark.trim() || undefined : `Port/Airport: ${exportPort.trim()}`,
      delivery_slot: orderType === 'domestic' ? deliverySlot : `International Export to ${countryName}`,
      order_notes: orderNotes.trim() || undefined,
      items: cart.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        unit_label: item.unit_label,
        quantity: item.quantity,
        price: item.sale_price ?? item.price,
        line_total: (item.sale_price ?? item.price) * item.quantity,
      })),
      subtotal,
      delivery_fee: deliveryFee,
      total: grandTotal,
    }

    let savedOrder: Order | null = null

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })
      if (response.ok) {
        const data = await response.json()
        savedOrder = data.order
      }
    } catch {
      // Proceed even if database fails
    }

    const orderRef = savedOrder?.order_ref || 'ORD-DIRECT'

    // Build the WhatsApp message
    let message = ''

    if (orderType === 'domestic') {
      message += `🛒 *NEW PAN-INDIA ORDER: ${orderRef}*\n`
      message += `*Store:* ${siteConfig.name}\n`
      message += `------------------------------------\n`
      message += `*ORDER ITEMS:*\n`

      cart.items.forEach((item, idx) => {
        const unitPrice = item.sale_price ?? item.price
        const total = unitPrice * item.quantity
        message += `${idx + 1}. *${item.product_name}* (${item.unit_label})\n`
        message += `   ${item.quantity} × ${formatPrice(unitPrice)} = ${formatPrice(total)}\n`
      })

      message += `------------------------------------\n`
      message += `Subtotal: ${formatPrice(subtotal)}\n`
      message += `Shipping: ${deliveryFee === 0 ? 'FREE (Pan-India)' : formatPrice(deliveryFee)}\n`
      message += `*Total Amount (COD): ${formatPrice(grandTotal)}*\n`
      message += `------------------------------------\n`
      message += `*DELIVERY DETAILS:*\n`
      message += `👤 *Name:* ${name.trim()}\n`
      message += `📞 *Phone:* ${phone.trim()}\n`
      message += `📍 *Address:* ${address.trim()}\n`
      message += `📮 *PIN Code:* ${pincode.trim()} (Pan-India)\n`
      if (landmark.trim()) message += `🏢 *Landmark:* ${landmark.trim()}\n`
      message += `⏰ *Slot:* ${deliverySlot}\n`
      if (orderNotes.trim()) message += `📝 *Notes:* ${orderNotes.trim()}\n`
      message += `------------------------------------\n`
      message += `Please confirm my order and share dispatch timeline. Thank you!`
    } else {
      // International Export Message
      message += `✈️ *INTERNATIONAL EXPORT INQUIRY: ${orderRef}*\n`
      message += `*Exporter:* ${siteConfig.name} (India)\n`
      message += `------------------------------------\n`
      message += `*REQUESTED PRODUCTS / QUANTITY:*\n`

      cart.items.forEach((item, idx) => {
        const unitPrice = item.sale_price ?? item.price
        const total = unitPrice * item.quantity
        message += `${idx + 1}. *${item.product_name}* (${item.unit_label})\n`
        message += `   Quantity: ${item.quantity} × ${item.unit_label} (Base: ${formatPrice(total)})\n`
      })

      message += `------------------------------------\n`
      message += `*ESTIMATED BASE VALUE:* ${formatPrice(subtotal)}\n`
      message += `------------------------------------\n`
      message += `*EXPORT SHIPMENT DETAILS:*\n`
      message += `👤 *Company / Contact:* ${name.trim()}\n`
      message += `📞 *Phone / WhatsApp:* ${phone.trim()}\n`
      message += `🌍 *Destination Country:* ${countryName}\n`
      if (exportPort.trim()) message += `⚓ *Port of Discharge:* ${exportPort.trim()}\n`
      message += `📍 *Delivery Address / City:* ${address.trim()}\n`
      if (orderNotes.trim()) message += `📦 *Export Notes (Air/Sea/Customs):* ${orderNotes.trim()}\n`
      message += `------------------------------------\n`
      message += `Please provide formal FOB/CIF quote with phytosanitary documentation and lead time. Thank you!`
    }

    const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')

    setConfirmedOrder(
      savedOrder || {
        id: 'ord-temp',
        order_ref: orderRef,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        delivery_address: orderPayload.delivery_address,
        pincode: orderPayload.pincode,
        landmark: orderPayload.landmark || null,
        delivery_slot: orderPayload.delivery_slot,
        order_notes: orderNotes.trim() || null,
        items: orderPayload.items,
        subtotal,
        delivery_fee: deliveryFee,
        total: grandTotal,
        status: 'new',
        created_at: new Date().toISOString(),
      }
    )

    setIsSubmitting(false)
  }

  const handleFinishAndClear = () => {
    clearCart()
    setConfirmedOrder(null)
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fdfbf5] py-8 pb-16">
        <div className="container-custom">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: 'Cart & Checkout' }]} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading text-[#1a2517]">
                Shopping Cart &amp; WhatsApp Checkout
              </h1>
              <p className="text-xs text-[#6b7c69] mt-1">
                Delivering across all Indian PIN codes + Certified agricultural exports worldwide
              </p>
            </div>
          </div>

          {cart.items.length === 0 && !confirmedOrder ? (
            <div className="bg-white rounded-3xl border border-[#dce8d8] p-12 text-center max-w-xl mx-auto shadow-sm my-12">
              <div className="w-20 h-20 rounded-3xl bg-[#e8f5ee] flex items-center justify-center mx-auto mb-5 text-4xl">
                🛒
              </div>
              <h2 className="text-2xl font-bold font-heading text-[#1a2517] mb-2">
                Your basket is empty
              </h2>
              <p className="text-[#6b7c69] text-sm mb-6 leading-relaxed">
                You haven&apos;t added any farm-fresh groceries yet. Explore our seasonal fruits,
                daily greens, and organic pantry staples.
              </p>
              <Button asChild size="lg">
                <Link href="/shop">
                  Browse All Products <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Cart Items Table (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-3xl border border-[#dce8d8] p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-[#dce8d8] mb-4">
                    <h2 className="font-bold text-lg text-[#1a2517]">
                      Order Items ({itemCount})
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-xs font-semibold text-[#c62828] hover:underline"
                    >
                      Clear Cart
                    </button>
                  </div>

                  {/* Free Delivery Bar for Pan-India */}
                  {orderType === 'domestic' && (
                    <div className="bg-[#f0f9f4] p-3.5 rounded-2xl mb-4 border border-[#dce8d8]">
                      {subtotal >= freeThreshold ? (
                        <p className="text-xs font-semibold text-[#1a6b3a] flex items-center gap-1.5">
                          <span>🎉</span> You qualify for <strong>FREE Pan-India Delivery</strong>!
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
                  )}

                  {/* Items list */}
                  <div className="divide-y divide-[#dce8d8]">
                    {cart.items.map((item) => {
                      const itemPrice = item.sale_price ?? item.price
                      const lineTotal = itemPrice * item.quantity
                      return (
                        <div key={item.product_id} className="py-4 flex gap-4 items-center">
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#f0f9f4] border border-[#dce8d8] flex-shrink-0">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.product_name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-2xl">🌿</div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/product/${item.slug}`}
                              className="text-sm font-semibold text-[#1a2517] hover:text-[#1a6b3a] line-clamp-1"
                            >
                              {item.product_name}
                            </Link>
                            <p className="text-xs text-[#6b7c69] mb-2">{item.unit_label}</p>
                            <div className="flex items-center gap-4">
                              <QuantityStepper
                                size="sm"
                                quantity={item.quantity}
                                onIncrement={() => updateQuantity(item.product_id, item.quantity + 1)}
                                onDecrement={() => updateQuantity(item.product_id, item.quantity - 1)}
                              />
                              <span className="text-xs text-[#6b7c69]">
                                @ {formatPrice(itemPrice)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-2">
                            <span className="font-bold text-sm text-[#1a6b3a]">
                              {formatPrice(lineTotal)}
                            </span>
                            <button
                              onClick={() => removeItem(item.product_id)}
                              className="text-[#6b7c69] hover:text-[#c62828] transition-colors p-1"
                              aria-label={`Remove ${item.product_name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center px-2">
                  <Link
                    href="/shop"
                    className="text-sm font-semibold text-[#1a6b3a] hover:underline"
                  >
                    &larr; Add more products
                  </Link>
                </div>
              </div>

              {/* Right: Checkout & Destination Selector (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl border border-[#dce8d8] p-6 shadow-sm space-y-5">
                  {/* Order Mode Toggle */}
                  <div className="bg-[#f0f9f4] p-1.5 rounded-2xl border border-[#dce8d8] grid grid-cols-2 gap-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setOrderType('domestic')}
                      className={`py-2 px-3 rounded-xl transition-all ${
                        orderType === 'domestic'
                          ? 'bg-[#1a6b3a] text-white shadow-xs'
                          : 'text-[#1a2517] hover:bg-[#e8f5ee]'
                      }`}
                    >
                      🇮🇳 Pan-India Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('export')}
                      className={`py-2 px-3 rounded-xl transition-all ${
                        orderType === 'export'
                          ? 'bg-[#1a6b3a] text-white shadow-xs'
                          : 'text-[#1a2517] hover:bg-[#e8f5ee]'
                      }`}
                    >
                      ✈️ Global Export Order
                    </button>
                  </div>

                  <div className="border-b border-[#dce8d8] pb-3">
                    <h2 className="font-bold text-lg text-[#1a2517]">
                      {orderType === 'domestic' ? 'Domestic Delivery Details' : 'International Export Inquiry'}
                    </h2>
                    <p className="text-xs text-[#6b7c69]">
                      {orderType === 'domestic'
                        ? 'Cash on Delivery (COD) / UPI across all Indian states.'
                        : 'Wholesale & consumer international agricultural exports with phytosanitary certificates.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label={orderType === 'domestic' ? 'Full Name' : 'Company / Contact Person'}
                      placeholder="e.g. Ramesh Kumar / Dubai Trading Co."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      error={errors.name}
                      required
                    />

                    <Input
                      label={orderType === 'domestic' ? 'Mobile Number' : 'WhatsApp Number (with country code)'}
                      type="tel"
                      placeholder={orderType === 'domestic' ? '9876543210' : '+971 50 123 4567'}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      error={errors.phone}
                      hint={orderType === 'domestic' ? '10-digit Indian phone number' : 'Include country code (+)'}
                      required
                    />

                    {orderType === 'domestic' ? (
                      <>
                        <Textarea
                          label="Delivery Address"
                          placeholder="Flat No, Building, Street, Area, City..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          error={errors.address}
                          rows={2}
                          required
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="PIN Code (Pan-India)"
                            placeholder="e.g. 500001 / 110001"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            error={errors.pincode}
                            maxLength={6}
                            hint="All Indian postal codes supported"
                            required
                          />

                          <Input
                            label="Landmark (Optional)"
                            placeholder="Near Metro / Temple"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                          />
                        </div>

                        <Select
                          label="Preferred Delivery Slot"
                          options={slotOptions}
                          value={deliverySlot}
                          onChange={(e) => setDeliverySlot(e.target.value)}
                          error={errors.slot}
                          required
                        />
                      </>
                    ) : (
                      <>
                        <Select
                          label="Destination Country"
                          options={siteConfig.delivery.exportDestinations.map((c) => ({
                            value: c.code,
                            label: c.name,
                          }))}
                          value={destinationCountry}
                          onChange={(e) => setDestinationCountry(e.target.value)}
                        />

                        <Input
                          label="Port of Discharge / Airport"
                          placeholder="e.g. Jebel Ali Port / Dubai Int'l Airport / Heathrow"
                          value={exportPort}
                          onChange={(e) => setExportPort(e.target.value)}
                          hint="Nearest seaport or air cargo terminal"
                        />

                        <Textarea
                          label="Delivery City / Facility Address"
                          placeholder="Warehouse or business location in destination country..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          error={errors.address}
                          rows={2}
                          required
                        />
                      </>
                    )}

                    <Input
                      label={orderType === 'domestic' ? 'Order Notes (Optional)' : 'Export Requirements (Optional)'}
                      placeholder={orderType === 'domestic' ? 'e.g. Ring bell twice / leave with security' : 'e.g. Refrigerated reefer, organic certification, specific packaging'}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    />
                  </div>

                  {/* Summary Totals */}
                  <div className="border-t border-[#dce8d8] pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-[#6b7c69]">
                      <span>Items Base Subtotal</span>
                      <span className="font-semibold text-[#1a2517]">{formatPrice(subtotal)}</span>
                    </div>

                    {orderType === 'domestic' ? (
                      <div className="flex justify-between text-[#6b7c69]">
                        <span>Pan-India Shipping</span>
                        <span>
                          {deliveryFee === 0 ? (
                            <span className="text-[#2e7d32] font-semibold">FREE</span>
                          ) : (
                            formatPrice(deliveryFee)
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-[#6b7c69]">
                        <span>International Freight</span>
                        <span className="text-xs font-semibold text-[#1a6b3a]">FOB / CIF Quotation via WhatsApp</span>
                      </div>
                    )}

                    <div className="border-t border-[#dce8d8] pt-2 flex justify-between text-lg font-bold text-[#1a2517]">
                      <span>{orderType === 'domestic' ? 'Estimated Total (COD)' : 'Estimated Product Value'}</span>
                      <span className="text-[#1a6b3a] font-heading">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  {/* WhatsApp Action */}
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full bg-[#1a6b3a] hover:bg-[#155530] text-base py-3.5 shadow-md"
                      onClick={handleOrderOnWhatsApp}
                      loading={isSubmitting}
                    >
                      <MessageCircle className="h-5 w-5 fill-current" />
                      {orderType === 'domestic' ? 'Order on WhatsApp (Pan-India) →' : 'Request Export Quote on WhatsApp →'}
                    </Button>
                    <p className="text-[11px] text-center text-[#6b7c69] mt-2">
                      {orderType === 'domestic'
                        ? 'Pre-fills your order details in WhatsApp Business with Sai Traders.'
                        : 'Connects directly with our export desk for quotation, shipping documents & lead time.'}
                    </p>
                  </div>
                </div>

                {/* Trust Callouts */}
                <div className="p-4 bg-white rounded-2xl border border-[#dce8d8] space-y-2 text-xs text-[#1a2517]">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#1a6b3a]" />
                    <span>Pan-India Courier &amp; Same-Day Metro Express</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-[#1a6b3a]" />
                    <span>Global Agricultural Exports (APEDA &amp; FSSAI compliant)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#1a6b3a]" />
                    <span>100% Quality inspection before packaging</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#dce8d8] text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#e8f5ee] text-[#1a6b3a] flex items-center justify-center mx-auto text-3xl">
              <CheckCircle2 className="h-10 w-10 text-[#2e7d32]" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#e8f5ee] text-[#1a6b3a] text-xs font-bold uppercase tracking-wider mb-2">
                {orderType === 'domestic' ? 'Pan-India Order Transmitted' : 'Export Inquiry Transmitted'}
              </span>
              <h2 className="text-2xl font-bold font-heading text-[#1a2517]">
                Thank You, {confirmedOrder.customer_name}!
              </h2>
              <p className="text-xs text-[#6b7c69] mt-1 font-mono font-semibold">
                Reference ID: {confirmedOrder.order_ref}
              </p>
            </div>

            <div className="bg-[#fdfbf5] p-4 rounded-2xl border border-[#dce8d8] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6b7c69]">Destination:</span>
                <span className="font-semibold text-[#1a2517]">{confirmedOrder.delivery_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7c69]">Estimated Value:</span>
                <span className="font-bold text-[#1a6b3a] text-sm">{formatPrice(confirmedOrder.total)}</span>
              </div>
            </div>

            <p className="text-xs text-[#6b7c69] leading-relaxed">
              We have received your WhatsApp request. Our team will verify produce availability and reply with confirmation shortly.
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleFinishAndClear}
              >
                Clear Cart &amp; Return to Home
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
