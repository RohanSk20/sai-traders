import React from 'react'
import Link from 'next/link'
import { Home, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Header />

      <main className="min-h-[70vh] bg-[#fdfbf5] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#dce8d8] p-8 sm:p-12 text-center shadow-lg space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[#e8f5ee] flex items-center justify-center mx-auto text-4xl">
            🌿
          </div>

          <div>
            <span className="font-mono text-sm font-bold text-[#1a6b3a] bg-[#f0f9f4] px-3 py-1 rounded-full">
              404 • Page Not Found
            </span>
            <h1 className="text-3xl font-heading font-bold text-[#1a2517] mt-3">
              Lost in the Produce Aisles?
            </h1>
            <p className="text-sm text-[#6b7c69] mt-2 leading-relaxed">
              The page or product you were looking for doesn&apos;t exist or may have been retired.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4" /> Home
              </Link>
            </Button>
            <Button asChild variant="primary" className="flex-1">
              <Link href="/shop">
                <ShoppingBag className="h-4 w-4" /> Shop Groceries
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
