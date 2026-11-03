// Database types matching the Supabase schema

export type StockStatus = 'in_stock' | 'out_of_stock'

export type OrderStatus = 'new' | 'confirmed' | 'delivered' | 'cancelled'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  category_id: string
  short_description: string | null
  description: string | null
  price: number
  sale_price: number | null
  unit_label: string
  stock_status: StockStatus
  is_organic: boolean
  is_featured: boolean
  is_active: boolean
  tags: string[]
  seo_title: string | null
  seo_description: string | null
  created_at: string
  // Joined
  category?: Category
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  sort_order: number
}

export interface ProductVariant {
  id: string
  product_id: string
  unit_label: string
  price: number
  sale_price: number | null
  stock_status: StockStatus
}

export interface Order {
  id: string
  order_ref: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  pincode: string
  landmark: string | null
  delivery_slot: string
  order_notes: string | null
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  created_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  unit_label: string
  quantity: number
  price: number
  line_total: number
}

// Cart types (client-side)
export interface CartItem {
  product_id: string
  product_name: string
  slug: string
  unit_label: string
  quantity: number
  price: number
  sale_price: number | null
  image_url: string | null
  stock_status: StockStatus
  variant_id?: string
}

export interface Cart {
  items: CartItem[]
  updatedAt: string
}

// API filter types
export interface ProductFilters {
  category?: string
  min_price?: number
  max_price?: number
  organic_only?: boolean
  in_stock_only?: boolean
  sale_only?: boolean
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest'
  page?: number
  per_page?: number
  search?: string
}

// Admin types
export interface DashboardStats {
  total_products: number
  total_categories: number
  out_of_stock: number
  total_orders: number
}

export interface CSVProductRow {
  name: string
  category: string
  price: string
  sale_price?: string
  unit: string
  description?: string
  image_url?: string
}
