'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  ChevronDown,
  Leaf,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { siteConfig, formatPrice } from '@/lib/config'
import { useCart } from '@/context/CartContext'
import { CartDrawer } from '@/components/layout/CartDrawer'
import type { Category, Product } from '@/types'

interface HeaderProps {
  categories?: Category[]
}

export function Header({ categories = [] }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount } = useCart()

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchBoxRef = useRef<HTMLDivElement>(null)

  // Sticky header shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false)
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Storing previous pathname to adjust state during render
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setMobileMenuOpen(false)
    setShowSuggestions(false)
  }

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      return
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.products || [])
          setShowSuggestions(true)
        }
      } catch {
        // Ignore fetch errors
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(timeout)
  }, [searchQuery])


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 bg-white transition-shadow duration-200',
          scrolled ? 'shadow-md' : 'shadow-sm border-b border-[#dce8d8]'
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 flex-shrink-0"
              aria-label={`${siteConfig.name} - Home`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#1a6b3a] flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="hidden sm:block">
                <span className="font-heading text-lg font-bold text-[#1a6b3a] leading-none">
                  {siteConfig.name}
                </span>
                <p className="text-[10px] text-[#6b7c69] leading-none">Fresh &amp; Organic</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-[#e8f5ee] text-[#1a6b3a]'
                      : 'text-[#1a2517] hover:text-[#1a6b3a] hover:bg-[#f0f9f4]'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Categories dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-[#1a2517] hover:text-[#1a6b3a] hover:bg-[#f0f9f4] transition-colors"
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                >
                  Categories
                  <ChevronDown
                    className={cn('h-4 w-4 transition-transform', categoriesOpen && 'rotate-180')}
                    aria-hidden="true"
                  />
                </button>

                {categoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#dce8d8] py-2 z-50 animate-in fade-in-50 duration-150">
                    <Link
                      href="/shop"
                      className="block px-4 py-2 text-sm text-[#1a2517] hover:bg-[#f0f9f4] hover:text-[#1a6b3a] font-semibold"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      All Products
                    </Link>
                    <div className="h-px bg-[#dce8d8] my-1" />
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="block px-4 py-2 text-sm text-[#1a2517] hover:bg-[#f0f9f4] hover:text-[#1a6b3a]"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Search Bar with Live Suggestions */}
            <div className="hidden md:block relative w-72 lg:w-80" ref={searchBoxRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search fresh groceries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                    className="w-full h-10 pl-10 pr-9 rounded-full border border-[#dce8d8] bg-white text-sm text-[#1a2517] placeholder:text-[#6b7c69] focus:outline-none focus:ring-2 focus:ring-[#1a6b3a]"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7c69]" />
                  {isSearching && (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a6b3a] animate-spin" />
                  )}
                </div>
              </form>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#dce8d8] overflow-hidden z-50">
                  <div className="p-2 divide-y divide-[#dce8d8]">
                    {suggestions.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f0f9f4] transition-colors"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#e8f5ee] flex-shrink-0">
                          {p.images?.[0] ? (
                            <Image
                              src={p.images[0].image_url}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-sm">🌿</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1a2517] truncate">{p.name}</p>
                          <p className="text-[11px] text-[#6b7c69]">{p.unit_label}</p>
                        </div>
                        <span className="text-xs font-bold text-[#1a6b3a]">
                          {formatPrice(p.sale_price ?? p.price)}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => setShowSuggestions(false)}
                    className="block text-center py-2.5 bg-[#f0f9f4] text-xs font-bold text-[#1a6b3a] hover:bg-[#e8f5ee] transition-colors border-t border-[#dce8d8]"
                  >
                    View all results for &ldquo;{searchQuery}&rdquo; &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Cart Button & Mobile Menu Trigger */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#e8f5ee] transition-colors"
                aria-label={`Shopping cart with ${itemCount} items`}
              >
                <ShoppingCart className="h-5 w-5 text-[#1a2517]" aria-hidden="true" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1a6b3a] text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
                    aria-hidden="true"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#e8f5ee] transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-[#1a2517]" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5 text-[#1a2517]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden border-t border-[#dce8d8] bg-white animate-in slide-in-from-top-4 duration-200"
            aria-label="Mobile navigation"
          >
            <div className="container-custom py-4 flex flex-col gap-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search fresh groceries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#dce8d8] bg-[#fdfbf5] text-sm text-[#1a2517] placeholder:text-[#6b7c69] focus:outline-none focus:ring-2 focus:ring-[#1a6b3a]"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7c69]" />
                </div>
              </form>

              {/* Nav links */}
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                      pathname === link.href
                        ? 'bg-[#e8f5ee] text-[#1a6b3a]'
                        : 'text-[#1a2517] hover:bg-[#f0f9f4]'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Categories */}
                {categories.length > 0 && (
                  <>
                    <p className="px-4 pt-3 pb-1 text-[11px] font-bold text-[#6b7c69] uppercase tracking-wider">
                      Shop Categories
                    </p>
                    <div className="grid grid-cols-2 gap-1 px-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className="px-3 py-2 rounded-xl text-xs font-medium text-[#1a2517] hover:bg-[#f0f9f4] hover:text-[#1a6b3a]"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  )
}
