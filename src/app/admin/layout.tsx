'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  Leaf,
  Store,
} from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Don't render admin chrome on the login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Ignore
    }
    router.push('/admin/login')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/admin/products', label: 'Products', icon: <Package className="h-5 w-5" /> },
    { href: '/admin/categories', label: 'Categories', icon: <Layers className="h-5 w-5" /> },
    { href: '/admin/orders', label: 'Orders', icon: <ShoppingBag className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-[#f4f7f4] flex flex-col lg:flex-row">
      {/* ─── Mobile Header ─────────────────────────────────────────────── */}
      <header className="lg:hidden bg-[#1a2517] text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a6b3a] flex items-center justify-center text-white">
            <Leaf className="h-4 w-4" />
          </div>
          <div>
            <span className="font-heading font-bold text-sm leading-none">{siteConfig.name}</span>
            <p className="text-[10px] text-[#8ccbaa]">Admin Portal</p>
          </div>
        </Link>

        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-white hover:text-[#f5c842]"
          aria-label="Toggle navigation"
        >
          {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* ─── Desktop & Mobile Sidebar ───────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a2517] text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-[#2d3d2a] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a6b3a] flex items-center justify-center text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-base leading-none block">{siteConfig.name}</span>
              <p className="text-[11px] text-[#8ccbaa] mt-0.5">Admin Management</p>
            </div>
          </Link>

          <button
            onClick={() => setMobileNavOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="p-4 flex-1 space-y-1.5" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1a6b3a] text-white shadow-sm'
                    : 'text-[#8ccbaa] hover:text-white hover:bg-[#2d3d2a]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#2d3d2a] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8ccbaa] hover:text-white hover:bg-[#2d3d2a] transition-colors"
          >
            <Store className="h-4 w-4" />
            <span>View Live Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#ff8a80] hover:text-white hover:bg-[#c62828] transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content Canvas ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navbar */}
        <header className="hidden lg:flex bg-white border-b border-[#dce8d8] h-16 px-8 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6b7c69] uppercase tracking-wider">
              Admin Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-[#1a6b3a] hover:underline flex items-center gap-1"
            >
              <Store className="h-4 w-4" /> View Storefront
            </Link>
            <div className="w-8 h-8 rounded-full bg-[#e8f5ee] text-[#1a6b3a] flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Children Page */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  )
}
