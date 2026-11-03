'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Leaf,
  ShoppingCart,
  Truck,
  Shield,
  Star,
  CheckCircle,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select, Checkbox, SearchBar } from '@/components/ui/FormElements'
import { Badge } from '@/components/ui/Badge'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { ProductCard } from '@/components/product/ProductCard'
import {
  SectionHeading,
  Breadcrumbs,
  Rating,
  TrustBadge,
  FeatureCard,
  CategoryCard,
  Skeleton,
} from '@/components/ui/index'
import { useToast } from '@/components/ui/Toast'
import { mockCategories, mockProducts } from '@/lib/mockData'

export default function DesignSystemPage() {
  const { showToast } = useToast()
  const [stepperVal, setStepperVal] = useState(2)
  const [checkboxVal, setCheckboxVal] = useState(true)
  const [searchVal, setSearchVal] = useState('')

  const colorTokens = [
    { name: 'Primary Dark Green', hex: '#1a6b3a', var: '--color-primary', text: 'text-white' },
    { name: 'Primary Hover', hex: '#155530', var: '--color-primary-hover', text: 'text-white' },
    { name: 'Primary Light Tint', hex: '#e8f5ee', var: '--color-primary-light', text: 'text-[#1a2517]' },
    { name: 'Accent Yellow', hex: '#f5c842', var: '--color-accent', text: 'text-[#1a2517]' },
    { name: 'Accent Hover', hex: '#e8b800', var: '--color-accent-hover', text: 'text-[#1a2517]' },
    { name: 'Cream Background', hex: '#fdfbf5', var: '--color-cream', text: 'text-[#1a2517]' },
    { name: 'Text Dark', hex: '#1a2517', var: '--color-text-dark', text: 'text-white' },
    { name: 'Text Muted', hex: '#6b7c69', var: '--color-text-muted', text: 'text-white' },
    { name: 'Border', hex: '#dce8d8', var: '--color-border', text: 'text-[#1a2517]' },
    { name: 'Success', hex: '#2e7d32', var: '--color-success', text: 'text-white' },
    { name: 'Warning', hex: '#f57f17', var: '--color-warning', text: 'text-white' },
    { name: 'Error', hex: '#c62828', var: '--color-error', text: 'text-white' },
  ]

  const shadowTokens = [
    { name: 'Soft Shadow', class: 'shadow-[0_2px_8px_rgba(26,107,58,0.08)]', desc: 'Default cards, badges' },
    { name: 'Card Shadow', class: 'shadow-[0_4px_16px_rgba(26,107,58,0.10)]', desc: 'Interactive elements' },
    { name: 'Floating Shadow', class: 'shadow-[0_8px_32px_rgba(26,107,58,0.15)]', desc: 'Modals, sticky bars' },
    { name: 'Hover Elevation', class: 'shadow-[0_8px_24px_rgba(26,107,58,0.18)]', desc: 'Card hover state' },
  ]

  const sampleProductInStock = mockProducts[0]
  const sampleProductOutStock = mockProducts[7]

  return (
    <div className="min-h-screen bg-[#fdfbf5] pb-24">
      {/* Header */}
      <header className="border-b border-[#dce8d8] bg-white sticky top-0 z-40">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a6b3a] flex items-center justify-center text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-[#1a6b3a]">
                Sai Traders Design System
              </h1>
              <p className="text-xs text-[#6b7c69]">Visual Tokens, Components &amp; UI States</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-[#1a6b3a] hover:underline flex items-center gap-1"
          >
            &larr; Back to Store
          </Link>
        </div>
      </header>

      <main className="container-custom py-12 space-y-16">
        {/* Intro */}
        <section>
          <div className="bg-[#e8f5ee] border border-[#8ccbaa] rounded-2xl p-6">
            <h2 className="text-2xl font-bold font-heading text-[#1a6b3a] mb-2">
              Visual Design Identity
            </h2>
            <p className="text-[#1a2517] leading-relaxed max-w-3xl text-sm">
              Approved design spec: Rich dark forest green with bright organic yellow accents,
              warm ivory cream backgrounds, soft rounded corners (16px - 24px), elevated floating
              cards, and editorial Playfair Display serif headings paired with clean, accessible
              Inter body typography.
            </p>
          </div>
        </section>

        {/* 1. Color Palette Tokens */}
        <section className="space-y-6">
          <SectionHeading
            pill="Tokens"
            title="Color Palette"
            subtitle="Hex values sampled directly from brand mockup. High contrast ratios compliant with WCAG AA standards."
            align="left"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {colorTokens.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl border border-[#dce8d8] overflow-hidden bg-white shadow-sm"
              >
                <div
                  className={`h-24 w-full flex items-end p-2.5 font-mono text-xs font-semibold ${c.text}`}
                  style={{ backgroundColor: c.hex }}
                >
                  {c.hex}
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-[#1a2517]">{c.name}</p>
                  <p className="text-[10px] text-[#6b7c69] font-mono mt-0.5">{c.var}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Typography Scale */}
        <section className="space-y-6">
          <SectionHeading
            pill="Typography"
            title="Type Scale &amp; Fonts"
            subtitle="Playfair Display (Serif) for headers + Inter (Sans-serif) for body text and navigation."
            align="left"
          />
          <div className="bg-white rounded-2xl border border-[#dce8d8] p-6 space-y-6">
            <div className="border-b border-[#dce8d8] pb-4">
              <span className="text-xs font-mono text-[#6b7c69]">H1 / Playfair Display Bold</span>
              <h1 className="text-4xl sm:text-5xl font-heading text-[#1a2517] mt-1">
                Fresh From Nature, Delivered to You
              </h1>
            </div>
            <div className="border-b border-[#dce8d8] pb-4">
              <span className="text-xs font-mono text-[#6b7c69]">H2 / Playfair Display Bold</span>
              <h2 className="text-3xl font-heading text-[#1a2517] mt-1">
                Shop by Fresh Category
              </h2>
            </div>
            <div className="border-b border-[#dce8d8] pb-4">
              <span className="text-xs font-mono text-[#6b7c69]">H3 / Playfair Display Bold</span>
              <h3 className="text-2xl font-heading text-[#1a2517] mt-1">
                Handpicked Ratnagiri Alphonso Mangoes
              </h3>
            </div>
            <div className="border-b border-[#dce8d8] pb-4">
              <span className="text-xs font-mono text-[#6b7c69]">H4 / Playfair Display Bold</span>
              <h4 className="text-xl font-heading text-[#1a2517] mt-1">
                Pure A2 Vedic Desi Ghee (Bilona Method)
              </h4>
            </div>
            <div className="border-b border-[#dce8d8] pb-4">
              <span className="text-xs font-mono text-[#6b7c69]">Body Large / Inter Regular</span>
              <p className="text-lg text-[#1a2517] leading-relaxed mt-1">
                Farm-fresh organic groceries sourced directly from local farmers. Order with one click on WhatsApp and get same-day doorstep delivery.
              </p>
            </div>
            <div>
              <span className="text-xs font-mono text-[#6b7c69]">Body Normal &amp; Small / Inter</span>
              <p className="text-base text-[#1a2517] leading-relaxed mt-1">
                Standard body paragraph text rendered with 16px Inter, high legibility line height (1.6), and rich contrast text (#1a2517).
              </p>
              <p className="text-xs text-[#6b7c69] mt-2">
                Caption &amp; Subtext (12px): Free delivery on all orders above ₹500 within serviceable city pincodes.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Radius & Elevation */}
        <section className="space-y-6">
          <SectionHeading
            pill="Elevation"
            title="Shadows &amp; Border Radius"
            subtitle="Soft organic green tinted shadows providing depth without harsh black borders."
            align="left"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {shadowTokens.map((s) => (
              <div
                key={s.name}
                className={`p-6 bg-white rounded-2xl border border-[#dce8d8] ${s.class}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#e8f5ee] flex items-center justify-center text-[#1a6b3a] mb-4">
                  <Shield className="h-5 w-5" />
                </div>
                <h4 className="text-base font-semibold text-[#1a2517] mb-1">{s.name}</h4>
                <p className="text-xs text-[#6b7c69]">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Buttons & Interactive States */}
        <section className="space-y-6">
          <SectionHeading
            pill="Components"
            title="Buttons &amp; States"
            subtitle="All button variants (Primary, Secondary, Outline, Ghost, Danger) across sizes, with hover, focus, disabled, and loading states."
            align="left"
          />
          <div className="bg-white rounded-2xl border border-[#dce8d8] p-8 space-y-8">
            {/* Variants */}
            <div>
              <h4 className="text-sm font-bold text-[#6b7c69] uppercase tracking-wider mb-4">
                Variants (Medium Size)
              </h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">
                  <ShoppingCart className="h-4 w-4" /> Primary Green
                </Button>
                <Button variant="secondary">
                  <Leaf className="h-4 w-4" /> Secondary Yellow
                </Button>
                <Button variant="outline">
                  <Search className="h-4 w-4" /> Outline
                </Button>
                <Button variant="ghost">
                  Ghost Button
                </Button>
                <Button variant="danger">
                  Danger Action
                </Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="text-sm font-bold text-[#6b7c69] uppercase tracking-wider mb-4">
                Sizes
              </h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button size="sm">Small (h-8)</Button>
                <Button size="md">Medium (h-10)</Button>
                <Button size="lg">Large (h-12)</Button>
                <Button size="icon" aria-label="Cart icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h4 className="text-sm font-bold text-[#6b7c69] uppercase tracking-wider mb-4">
                Interactive States
              </h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary" loading>
                  Loading State
                </Button>
                <Button variant="primary" disabled>
                  Disabled Primary
                </Button>
                <Button variant="outline" disabled>
                  Disabled Outline
                </Button>
                <Button
                  variant="primary"
                  onClick={() => showToast('Toast alert triggered from Design System!', 'success')}
                >
                  Click for Toast Test
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Form Elements */}
        <section className="space-y-6">
          <SectionHeading
            pill="Components"
            title="Form Inputs &amp; Controls"
            subtitle="Input, Select, Textarea, Checkbox, SearchBar with validation errors, hints, and active states."
            align="left"
          />
          <div className="bg-white rounded-2xl border border-[#dce8d8] p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Ramesh Kumar"
                required
                hint="As per delivery address"
              />
              <Input
                label="Phone Number"
                placeholder="9876543210"
                error="Please enter a valid 10-digit Indian phone number"
                defaultValue="12345"
              />
              <Select
                label="Preferred Delivery Slot"
                options={[
                  { value: 'today-evening', label: 'Today: 4:00 PM – 7:00 PM' },
                  { value: 'tomorrow-morning', label: 'Tomorrow: 8:00 AM – 11:00 AM' },
                  { value: 'tomorrow-evening', label: 'Tomorrow: 4:00 PM – 7:00 PM' },
                ]}
              />
            </div>

            <div className="space-y-4">
              <Textarea
                label="Delivery Address"
                placeholder="Flat / House No., Building Name, Street..."
                required
                rows={3}
              />
              <div>
                <label className="block text-sm font-medium text-[#1a2517] mb-1.5">
                  Live Search Bar
                </label>
                <SearchBar
                  value={searchVal}
                  onChange={setSearchVal}
                  placeholder="Search 24+ organic groceries..."
                />
              </div>
              <div className="pt-2">
                <Checkbox
                  label="I agree to receive order confirmations and delivery updates on WhatsApp"
                  checked={checkboxVal}
                  onChange={(e) => setCheckboxVal(e.target.checked)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6. Badges & Steppers */}
        <section className="space-y-6">
          <SectionHeading
            pill="Components"
            title="Badges, Stepper &amp; Ratings"
            subtitle="Visual status indicators and micro-interactions."
            align="left"
          />
          <div className="bg-white rounded-2xl border border-[#dce8d8] p-8 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-[#6b7c69] uppercase tracking-wider mb-3">
                Badges
              </h4>
              <div className="flex flex-wrap gap-3">
                <Badge variant="organic">100% Organic</Badge>
                <Badge variant="sale">-20% OFF</Badge>
                <Badge variant="new">New Season</Badge>
                <Badge variant="featured">Featured Pick</Badge>
                <Badge variant="out-of-stock">Out of Stock</Badge>
                <Badge variant="success">Confirmed</Badge>
                <Badge variant="warning">Low Stock</Badge>
                <Badge variant="error">Cancelled</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#dce8d8]">
              <div>
                <h4 className="text-sm font-bold text-[#6b7c69] uppercase tracking-wider mb-3">
                  Quantity Stepper
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[#6b7c69] block mb-1">Normal Size:</span>
                    <QuantityStepper
                      quantity={stepperVal}
                      onIncrement={() => setStepperVal((v) => v + 1)}
                      onDecrement={() => setStepperVal((v) => Math.max(1, v - 1))}
                    />
                  </div>
                  <div>
                    <span className="text-xs text-[#6b7c69] block mb-1">Small Size (Card):</span>
                    <QuantityStepper
                      size="sm"
                      quantity={stepperVal}
                      onIncrement={() => setStepperVal((v) => v + 1)}
                      onDecrement={() => setStepperVal((v) => Math.max(1, v - 1))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#6b7c69] uppercase tracking-wider mb-3">
                  Star Rating
                </h4>
                <div className="space-y-3">
                  <Rating value={4.9} showValue count={128} size="md" />
                  <Rating value={4.5} showValue size="sm" />
                  <Rating value={5} size="lg" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#6b7c69] uppercase tracking-wider mb-3">
                  Breadcrumbs
                </h4>
                <Breadcrumbs
                  items={[
                    { label: 'Shop', href: '/shop' },
                    { label: 'Fruits', href: '/category/fruits' },
                    { label: 'Alphonso Mangoes' },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 7. Product Cards */}
        <section className="space-y-6">
          <SectionHeading
            pill="Components"
            title="Product Cards"
            subtitle="In-stock with stepper, sale discount badge, out-of-stock state, and responsive sizing."
            align="left"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <ProductCard product={sampleProductInStock} />
            <ProductCard product={mockProducts[4]} />
            <ProductCard product={mockProducts[8]} />
            <ProductCard product={sampleProductOutStock} />
          </div>
        </section>

        {/* 8. Feature Cards & Trust Badges */}
        <section className="space-y-6">
          <SectionHeading
            pill="Components"
            title="Feature Cards &amp; Trust Badges"
            subtitle="Modular trust building UI elements for marketing and checkout confidence."
            align="left"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Leaf className="h-6 w-6" />}
              title="100% Certified Organic"
              description="Sourced from accredited natural farms with zero artificial pesticides or coloring."
            />
            <FeatureCard
              icon={<Truck className="h-6 w-6" />}
              title="Same Day Delivery"
              description="Orders placed before 2:00 PM are delivered fresh to your door the same evening."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Secure Ordering"
              description="Simple WhatsApp checkout. Pay Cash on Delivery after inspecting your fresh produce."
            />
            <FeatureCard
              icon={<Star className="h-6 w-6" />}
              title="Purity Guaranteed"
              description="Hand-picked and double-checked for freshness before being packed in eco-boxes."
            />
          </div>

          <div className="flex flex-wrap gap-6 bg-white p-6 rounded-2xl border border-[#dce8d8] items-center justify-around">
            <TrustBadge icon={<CheckCircle className="h-4 w-4" />} label="Zero Chemical Residue" />
            <TrustBadge icon={<Truck className="h-4 w-4" />} label="Free Delivery Above ₹500" />
            <TrustBadge icon={<Shield className="h-4 w-4" />} label="Cash On Delivery" />
            <TrustBadge icon={<Leaf className="h-4 w-4" />} label="Biodegradable Packaging" />
          </div>
        </section>

        {/* 9. Category Cards */}
        <section className="space-y-6">
          <SectionHeading
            pill="Components"
            title="Category Cards"
            subtitle="Iconic grid cards linking to dedicated category shopping catalogs."
            align="left"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockCategories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </section>

        {/* 10. Skeletons */}
        <section className="space-y-6">
          <SectionHeading
            pill="Loading States"
            title="Shimmer Skeletons"
            subtitle="Smooth shimmer animations preventing layout shifts (CLS)."
            align="left"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#dce8d8] p-4 space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
