import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getProducts, upsertProduct, deleteProduct, toggleProductStock } from '@/lib/db'
import { getLocalStore } from '@/lib/localStore'
import type { Product } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('q') || undefined

    const { products, total } = await getProducts({ category, search, per_page: 200 })
    return NextResponse.json({ success: true, products, total })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch products'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Product>
    if (!body.name || !body.price) {
      return NextResponse.json(
        { success: false, error: 'Product name and price are required' },
        { status: 400 }
      )
    }

    const saved = await upsertProduct(body)

    // Clear server cache so main client page displays updates instantly
    revalidatePath('/')
    revalidatePath('/shop')
    revalidatePath('/search')
    if (saved.slug) {
      revalidatePath(`/product/${saved.slug}`)
    }

    return NextResponse.json({ success: true, product: saved })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save product'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, stock_status, is_active } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 })
    }

    let updated: Product | null = null

    if (stock_status !== undefined) {
      const store = getLocalStore()
      const existing = store.products.find((p) => p.id === id)
      if (existing) {
        updated = await upsertProduct({ ...existing, stock_status })
      }
    } else if (is_active !== undefined) {
      const store = getLocalStore()
      const existing = store.products.find((p) => p.id === id)
      if (existing) {
        updated = await upsertProduct({ ...existing, is_active })
      }
    }

    revalidatePath('/')
    revalidatePath('/shop')
    revalidatePath('/search')

    return NextResponse.json({ success: true, product: updated })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update product'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 })
    }

    await deleteProduct(id)

    revalidatePath('/')
    revalidatePath('/shop')
    revalidatePath('/search')

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete product'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
