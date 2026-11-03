import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''

  if (!q.trim()) {
    return NextResponse.json({ products: [] })
  }

  const products = await searchProducts(q.trim(), 5)
  return NextResponse.json({ products })
}
