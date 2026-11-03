import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order, error } = await createOrder(body)

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 })
    }

    return NextResponse.json({ success: true, order })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
