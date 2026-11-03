import { createClient } from '@/lib/supabase/server'
import { getLocalStore, saveLocalStore } from '@/lib/localStore'
import type {
  Category,
  Product,
  ProductFilters,
  Order,
  OrderItem,
  OrderStatus,
  DashboardStats,
} from '@/types'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(
    url &&
    key &&
    !url.includes('your-project') &&
    !key.includes('your-anon-key') &&
    url.startsWith('https://')
  )
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const store = getLocalStore()

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (!error && data && data.length > 0) {
        return data
      }
    } catch {
      // fallback to localStore
    }
  }

  return store.categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const store = getLocalStore()

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (!error && data) {
        return data
      }
    } catch {
      // fallback to localStore
    }
  }

  const found = store.categories.find((c) => c.slug === slug && c.is_active)
  return found || null
}

export async function getAllCategories(): Promise<Category[]> {
  const store = getLocalStore()

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!error && data && data.length > 0) {
        return data
      }
    } catch {
      // fallback to localStore
    }
  }

  return [...store.categories].sort((a, b) => a.sort_order - b.sort_order)
}

export async function upsertCategory(category: Partial<Category>): Promise<Category> {
  const store = getLocalStore()
  let savedCat: Category

  if (category.id) {
    const idx = store.categories.findIndex((c) => c.id === category.id)
    if (idx !== -1) {
      store.categories[idx] = { ...store.categories[idx], ...category }
      savedCat = store.categories[idx]
    } else {
      savedCat = {
        id: category.id,
        name: category.name || 'New Category',
        slug: category.slug || `cat-${Date.now()}`,
        description: category.description || null,
        image_url: category.image_url || null,
        sort_order: category.sort_order ?? store.categories.length + 1,
        is_active: category.is_active ?? true,
        created_at: new Date().toISOString(),
      }
      store.categories.push(savedCat)
    }
  } else {
    savedCat = {
      id: `cat-${Date.now()}`,
      name: category.name || 'New Category',
      slug: category.slug || `cat-${Date.now()}`,
      description: category.description || null,
      image_url: category.image_url || null,
      sort_order: category.sort_order ?? store.categories.length + 1,
      is_active: category.is_active ?? true,
      created_at: new Date().toISOString(),
    }
    store.categories.push(savedCat)
  }

  saveLocalStore(store)

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('categories')
        .upsert(category)
        .select()
        .single()
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase upsertCategory fallback to local store:', err)
    }
  }

  return savedCat
}

export async function deleteCategory(id: string): Promise<boolean> {
  const store = getLocalStore()
  store.categories = store.categories.filter((c) => c.id !== id)
  saveLocalStore(store)

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      await supabase.from('categories').delete().eq('id', id)
    } catch {
      // ignore
    }
  }

  return true
}


// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(filters: ProductFilters = {}): Promise<{
  products: Product[]
  total: number
}> {
  const {
    category,
    min_price,
    max_price,
    organic_only,
    in_stock_only,
    sale_only,
    sort = 'relevance',
    page = 1,
    per_page = 24,
    search,
  } = filters

  if (!isSupabaseConfigured()) {
    return getProductsFallback(filters)
  }

  try {
    const supabase = await createClient()
    let query = supabase
      .from('products')
      .select(
        `
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `,
        { count: 'exact' }
      )
      .eq('is_active', true)

    if (category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    if (min_price !== undefined) query = query.gte('price', min_price)
    if (max_price !== undefined) query = query.lte('price', max_price)
    if (organic_only) query = query.eq('is_organic', true)
    if (in_stock_only) query = query.eq('stock_status', 'in_stock')
    if (sale_only) query = query.not('sale_price', 'is', null)
    if (search) query = query.ilike('name', `%${search}%`)

    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      default:
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
    }

    const from = (page - 1) * per_page
    const to = from + per_page - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error || !data || data.length === 0) {
      // Fallback
      return getProductsFallback(filters)
    }

    const products = data.map((p) => ({
      ...p,
      images: p.images?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
    }))

    return { products, total: count || 0 }
  } catch {
    return getProductsFallback(filters)
  }
}

function getProductsFallback(filters: ProductFilters) {
  const store = getLocalStore()
  let list = store.products
    .map((p) => ({
      ...p,
      category: store.categories.find((c) => c.id === p.category_id),
    }))
    .filter((p) => p.is_active)

  if (filters.category) {
    const cat = store.categories.find((c) => c.slug === filters.category)
    if (cat) list = list.filter((p) => p.category_id === cat.id)
  }
  if (filters.organic_only) list = list.filter((p) => p.is_organic)
  if (filters.in_stock_only) list = list.filter((p) => p.stock_status === 'in_stock')
  if (filters.sale_only) list = list.filter((p) => !!p.sale_price)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(q))
  }

  const page = filters.page || 1
  const per_page = filters.per_page || 24
  const from = (page - 1) * per_page
  return { products: list.slice(from, from + per_page), total: list.length }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const store = getLocalStore()

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `
        )
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (!error && data) {
        return {
          ...data,
          images: data.images?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
        }
      }
    } catch {
      // fallback
    }
  }

  const p = store.products.find((item) => item.slug === slug && item.is_active)
  if (!p) return null
  const cat = store.categories.find((c) => c.id === p.category_id)
  return { ...p, category: cat }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const store = getLocalStore()

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          category:categories(*),
          images:product_images(*)
        `
        )
        .eq('is_active', true)
        .eq('is_featured', true)
        .eq('stock_status', 'in_stock')
        .limit(8)

      if (!error && data && data.length > 0) {
        return data
      }
    } catch {
      // fallback
    }
  }

  return store.products
    .filter((p) => p.is_featured && p.is_active)
    .slice(0, 8)
    .map((p) => ({ ...p, category: store.categories.find((c) => c.id === p.category_id) }))
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
): Promise<Product[]> {
  const store = getLocalStore()
  const related = store.products
    .filter((p) => p.category_id === categoryId && p.id !== productId && p.is_active)
    .slice(0, limit)
    .map((p) => ({ ...p, category: store.categories.find((c) => c.id === p.category_id) }))

  if (!isSupabaseConfigured()) {
    return related
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select(
        `
        *,
        category:categories(*),
        images:product_images(*)
      `
      )
      .eq('is_active', true)
      .eq('category_id', categoryId)
      .neq('id', productId)
      .limit(limit)

    if (!error && data && data.length > 0) return data
    return related
  } catch {
    return related
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  const store = getLocalStore()

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('products')
        .select('slug')
        .eq('is_active', true)

      if (!error && data && data.length > 0) {
        return data.map((p) => p.slug)
      }
    } catch {
      // fallback
    }
  }

  return store.products.filter((p) => p.is_active).map((p) => p.slug)
}

export async function searchProducts(query: string, limit = 5): Promise<Product[]> {
  const store = getLocalStore()
  const q = query.toLowerCase().trim()
  const matched = store.products
    .filter(
      (p) =>
        p.is_active &&
        (p.name.toLowerCase().includes(q) ||
          p.short_description?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)))
    )
    .slice(0, limit)
    .map((p) => ({ ...p, category: store.categories.find((c) => c.id === p.category_id) }))

  if (!isSupabaseConfigured()) return matched

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select(
        `
        *,
        category:categories(*),
        images:product_images(*)
      `
      )
      .eq('is_active', true)
      .ilike('name', `%${query}%`)
      .limit(limit)

    if (!error && data && data.length > 0) return data
    return matched
  } catch {
    return matched
  }
}

export async function toggleProductStock(id: string): Promise<Product | null> {
  const store = getLocalStore()
  const target = store.products.find((p) => p.id === id)
  if (target) {
    target.stock_status = target.stock_status === 'in_stock' ? 'out_of_stock' : 'in_stock'
    saveLocalStore(store)
  }

  if (isSupabaseConfigured() && target) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('products')
        .update({ stock_status: target.stock_status })
        .eq('id', id)
        .select()
        .single()

      if (data) return data
    } catch {
      // fallback
    }
  }

  return target || null
}

export async function upsertProduct(product: Partial<Product>): Promise<Product> {
  const store = getLocalStore()
  let savedProd: Product

  if (product.id) {
    const idx = store.products.findIndex((p) => p.id === product.id)
    if (idx !== -1) {
      store.products[idx] = {
        ...store.products[idx],
        ...product,
        category: store.categories.find((c) => c.id === (product.category_id || store.products[idx].category_id)),
      } as Product
      savedProd = store.products[idx]
    } else {
      savedProd = {
        id: product.id,
        name: product.name || 'Untitled Product',
        slug: product.slug || `prod-${Date.now()}`,
        category_id: product.category_id || store.categories[0]?.id || 'cat-1',
        short_description: product.short_description || null,
        description: product.description || null,
        price: Number(product.price) || 0,
        sale_price: product.sale_price ? Number(product.sale_price) : null,
        unit_label: product.unit_label || '1 kg',
        stock_status: product.stock_status || 'in_stock',
        is_organic: product.is_organic ?? false,
        is_featured: product.is_featured ?? false,
        is_active: product.is_active ?? true,
        tags: product.tags || [],
        seo_title: product.seo_title || null,
        seo_description: product.seo_description || null,
        created_at: new Date().toISOString(),
        images: product.images || [],
        variants: product.variants || [],
        category: store.categories.find((c) => c.id === (product.category_id || store.categories[0]?.id)),
      }
      store.products.unshift(savedProd)
    }
  } else {
    savedProd = {
      id: `prod-${Date.now()}`,
      name: product.name || 'Untitled Product',
      slug: product.slug || `prod-${Date.now()}`,
      category_id: product.category_id || store.categories[0]?.id || 'cat-1',
      short_description: product.short_description || null,
      description: product.description || null,
      price: Number(product.price) || 0,
      sale_price: product.sale_price ? Number(product.sale_price) : null,
      unit_label: product.unit_label || '1 kg',
      stock_status: product.stock_status || 'in_stock',
      is_organic: product.is_organic ?? false,
      is_featured: product.is_featured ?? false,
      is_active: product.is_active ?? true,
      tags: product.tags || [],
      seo_title: product.seo_title || null,
      seo_description: product.seo_description || null,
      created_at: new Date().toISOString(),
      images: product.images || [],
      variants: product.variants || [],
      category: store.categories.find((c) => c.id === (product.category_id || store.categories[0]?.id)),
    }
    store.products.unshift(savedProd)
  }

  saveLocalStore(store)

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('products')
        .upsert(product)
        .select()
        .single()

      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase upsertProduct fallback to local store:', err)
    }
  }

  return savedProd
}

export async function deleteProduct(id: string): Promise<boolean> {
  const store = getLocalStore()
  store.products = store.products.filter((p) => p.id !== id)
  saveLocalStore(store)

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      await supabase.from('products').delete().eq('id', id)
    } catch {
      // ignore
    }
  }

  return true
}


// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(orderData: {
  customer_name: string
  customer_phone: string
  delivery_address: string
  pincode: string
  landmark?: string
  delivery_slot: string
  order_notes?: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
}): Promise<{ order: Order | null; error: string | null }> {
  const store = getLocalStore()
  const nextNum = 1000 + store.orders.length + 1
  const order_ref = `ORD-${nextNum}`

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    order_ref,
    customer_name: orderData.customer_name,
    customer_phone: orderData.customer_phone,
    delivery_address: orderData.delivery_address,
    pincode: orderData.pincode,
    landmark: orderData.landmark || null,
    delivery_slot: orderData.delivery_slot,
    order_notes: orderData.order_notes || null,
    items: orderData.items,
    subtotal: orderData.subtotal,
    delivery_fee: orderData.delivery_fee,
    total: orderData.total,
    status: 'new',
    created_at: new Date().toISOString(),
  }

  store.orders.unshift(newOrder)
  saveLocalStore(store)

  if (!isSupabaseConfigured()) {
    return { order: newOrder, error: null }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        order_ref,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.warn('Supabase insert order error, keeping local fallback:', error.message)
      return { order: newOrder, error: null }
    }
    return { order: data, error: null }
  } catch {
    return { order: newOrder, error: null }
  }
}

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  const store = getLocalStore()

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (status) query = query.eq('status', status)
      const { data, error } = await query
      if (!error && data && data.length > 0) {
        return data
      }
    } catch {
      // fallback
    }
  }

  return status ? store.orders.filter((o) => o.status === status) : store.orders
}

export async function getOrderById(id: string): Promise<Order | null> {
  const store = getLocalStore()
  const local = store.orders.find((o) => o.id === id || o.order_ref === id)

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.eq.${id},order_ref.eq.${id}`)
        .single()

      if (!error && data) return data
    } catch {
      // fallback
    }
  }

  return local || null
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<boolean> {
  const store = getLocalStore()
  const order = store.orders.find((o) => o.id === id)
  if (order) {
    order.status = status
    saveLocalStore(store)
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
    } catch {
      // ignore
    }
  }

  return true
}

// ─── Admin Dashboard Stats ───────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const store = getLocalStore()

  if (!isSupabaseConfigured()) {
    return {
      total_products: store.products.length,
      total_categories: store.categories.length,
      out_of_stock: store.products.filter((p) => p.stock_status === 'out_of_stock').length,
      total_orders: store.orders.length,
    }
  }

  try {
    const supabase = await createClient()
    const [productsResult, categoriesResult, outOfStockResult, ordersResult] =
      await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('stock_status', 'out_of_stock')
          .eq('is_active', true),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ])

    return {
      total_products: productsResult.count || store.products.length,
      total_categories: categoriesResult.count || store.categories.length,
      out_of_stock: outOfStockResult.count || store.products.filter((p) => p.stock_status === 'out_of_stock').length,
      total_orders: ordersResult.count || store.orders.length,
    }
  } catch {
    return {
      total_products: store.products.length,
      total_categories: store.categories.length,
      out_of_stock: store.products.filter((p) => p.stock_status === 'out_of_stock').length,
      total_orders: store.orders.length,
    }
  }
}

