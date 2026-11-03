'use client'

import React, { useEffect } from 'react'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] bg-[#fdfbf5] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#dce8d8] p-8 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#ffebee] text-[#c62828] flex items-center justify-center mx-auto text-3xl">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1a2517]">
            Something unexpected occurred
          </h1>
          <p className="text-xs text-[#6b7c69] mt-2 leading-relaxed">
            We encountered a temporary error loading this section. Our team has been notified.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => reset()}>
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
          <Button asChild variant="primary" className="flex-1">
            <Link href="/">
              <Home className="h-4 w-4" /> Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
