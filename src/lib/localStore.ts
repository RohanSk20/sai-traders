import fs from 'fs'
import path from 'path'
import { mockCategories, mockProducts, mockOrders } from '@/lib/mockData'
import type { Category, Product, Order } from '@/types'

const DATA_DIR = path.join(process.cwd(), '.data')
const DATA_FILE = path.join(DATA_DIR, 'store.json')

export interface StoreData {
  products: Product[]
  categories: Category[]
  orders: Order[]
}

export function getLocalStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      return {
        products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : [...mockProducts],
        categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : [...mockCategories],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [...mockOrders],
      }
    }
  } catch (err) {
    console.warn('Error reading .data/store.json:', err)
  }

  const defaultStore: StoreData = {
    products: [...mockProducts],
    categories: [...mockCategories],
    orders: [...mockOrders],
  }
  saveLocalStore(defaultStore)
  return defaultStore
}

export function saveLocalStore(data: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.warn('Error saving .data/store.json:', err)
  }
}
