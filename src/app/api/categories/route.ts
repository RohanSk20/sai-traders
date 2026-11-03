import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAllCategories, upsertCategory, deleteCategory } from '@/lib/db'
import type { Category } from '@/types'

export async function GET() {
  try {
    const categories = await getAllCategories()
    return NextResponse.json({ success: true, categories })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch categories'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Category>
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }

    const saved = await upsertCategory(body)

    revalidatePath('/')
    revalidatePath('/shop')
    if (saved.slug) {
      revalidatePath(`/category/${saved.slug}`)
    }

    return NextResponse.json({ success: true, category: saved })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save category'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 })
    }

    await deleteCategory(id)

    revalidatePath('/')
    revalidatePath('/shop')

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete category'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
