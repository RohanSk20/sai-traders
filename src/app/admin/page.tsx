import React from 'react'
import Link from 'next/link'
import {
  Package,
  Layers,
  AlertTriangle,
  ShoppingBag,
  Plus,
  MessageCircle,
} from 'lucide-react'
import { getDashboardStats, getOrders } from '@/lib/db'
import { formatPrice, siteConfig } from '@/lib/config'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getOrders(),
  ])

  const statCards = [
    {
      title: 'Total Products',
      value: stats.total_products,
      href: '/admin/products',
      icon: <Package className="h-6 w-6 text-[#1a6b3a]" />,
      bg: 'bg-[#e8f5ee]',
    },
    {
      title: 'Active Categories',
      value: stats.total_categories,
      href: '/admin/categories',
      icon: <Layers className="h-6 w-6 text-[#1565c0]" />,
      bg: 'bg-[#e3f2fd]',
    },
    {
      title: 'Out of Stock Items',
      value: stats.out_of_stock,
      href: '/admin/products?stock=out_of_stock',
      icon: <AlertTriangle className="h-6 w-6 text-[#c62828]" />,
      bg: 'bg-[#ffebee]',
    },
    {
      title: 'Total WhatsApp Orders',
      value: stats.total_orders,
      href: '/admin/orders',
      icon: <ShoppingBag className="h-6 w-6 text-[#f57f17]" />,
      bg: 'bg-[#fff8e1]',
    },
  ]

  const statusVariants: Record<string, 'new' | 'success' | 'warning' | 'error'> = {
    new: 'new',
    confirmed: 'success',
    delivered: 'success',
    cancelled: 'error',
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#1a2517]">
            Overview Dashboard
          </h1>
          <p className="text-xs text-[#6b7c69] mt-0.5">
            Welcome back! Monitor grocery catalog inventory, stock alerts, and incoming WhatsApp orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/admin/products?action=new">
              <Plus className="h-4 w-4" /> Add Product
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/categories">Manage Categories</Link>
          </Button>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white p-6 rounded-3xl border border-[#dce8d8] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-[#6b7c69] uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-3xl font-bold font-heading text-[#1a2517] mt-1">
                {card.value}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center`}>
              {card.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-[#dce8d8] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#dce8d8] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-heading text-[#1a2517]">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-[#6b7c69]">
              Orders captured from customer WhatsApp checkout
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#1a6b3a] hover:underline flex items-center gap-1"
          >
            View All ({stats.total_orders}) &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#6b7c69]">
            No orders placed yet. Orders received via WhatsApp checkout will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fdfbf5] text-xs font-bold text-[#6b7c69] uppercase tracking-wider border-b border-[#dce8d8]">
                <tr>
                  <th className="px-6 py-4">Ref #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce8d8]">
                {recentOrders.slice(0, 5).map((order) => {
                  const replyUrl = `https://wa.me/${order.customer_phone}?text=${encodeURIComponent(
                    `Hello ${order.customer_name}, regarding your order ${order.order_ref} at ${siteConfig.name}...`
                  )}`

                  return (
                    <tr key={order.id} className="hover:bg-[#f0f9f4]/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-[#1a6b3a]">
                        {order.order_ref}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#1a2517]">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 text-[#6b7c69] font-mono text-xs">
                        {order.customer_phone}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#1a2517]">
                        {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1a2517]">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariants[order.status] || 'new'}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={replyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#e8f5ee] text-[#1a6b3a] hover:bg-[#1a6b3a] hover:text-white transition-colors text-xs font-semibold"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Reply
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
