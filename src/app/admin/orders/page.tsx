'use client'

import React, { useState } from 'react'
import {
  Search,
  MessageCircle,
  Eye,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, siteConfig } from '@/lib/config'
import { mockOrders } from '@/lib/mockData'
import type { Order, OrderStatus } from '@/types'

export default function AdminOrdersPage() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      o.order_ref.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)

    return matchStatus && matchSearch
  })

  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    )
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
    showToast(`Order marked as ${newStatus}`, 'success')
  }

  const statusBadges: Record<OrderStatus, 'new' | 'success' | 'warning' | 'error'> = {
    new: 'new',
    confirmed: 'success',
    delivered: 'success',
    cancelled: 'error',
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#1a2517]">
            Customer Orders
          </h1>
          <p className="text-xs text-[#6b7c69]">
            Orders received through website WhatsApp checkout
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#dce8d8] shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[220px] max-w-sm relative">
          <input
            type="search"
            placeholder="Search by Order Ref, customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-[#dce8d8] text-xs bg-[#fdfbf5] focus:outline-none focus:ring-2 focus:ring-[#1a6b3a]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7c69]" />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'new', 'confirmed', 'delivered', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-[#1a6b3a] text-white shadow-xs'
                  : 'bg-[#f0f9f4] text-[#1a2517] hover:bg-[#e8f5ee]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#dce8d8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fdfbf5] text-xs font-bold text-[#6b7c69] uppercase tracking-wider border-b border-[#dce8d8]">
              <tr>
                <th className="px-6 py-4">Order Ref</th>
                <th className="px-6 py-4">Customer &amp; Phone</th>
                <th className="px-6 py-4">Delivery Address &amp; Slot</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dce8d8]">
              {filteredOrders.map((order) => {
                const replyUrl = `https://wa.me/${order.customer_phone}?text=${encodeURIComponent(
                  `Hi ${order.customer_name}! This is ${siteConfig.name} regarding your order ${order.order_ref}...`
                )}`

                return (
                  <tr key={order.id} className="hover:bg-[#f0f9f4]/40 transition-colors">
                    {/* Order Ref */}
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-xs text-[#1a6b3a] bg-[#e8f5ee] px-2.5 py-1 rounded-lg">
                        {order.order_ref}
                      </span>
                      <p className="text-[10px] text-[#6b7c69] mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1a2517]">{order.customer_name}</p>
                      <p className="font-mono text-xs text-[#6b7c69]">{order.customer_phone}</p>
                    </td>

                    {/* Delivery Details */}
                    <td className="px-6 py-4 text-xs">
                      <p className="text-[#1a2517] max-w-xs truncate">{order.delivery_address}</p>
                      <p className="text-[#6b7c69]">Pin: {order.pincode} • {order.delivery_slot}</p>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-base text-[#1a6b3a]">
                        {formatPrice(order.total)}
                      </span>
                      <p className="text-[10px] text-[#6b7c69]">
                        {order.items.length} item{order.items.length === 1 ? '' : 's'} (COD)
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <Badge variant={statusBadges[order.status] || 'new'}>
                        {order.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg bg-[#e8f5ee] text-[#1a6b3a] hover:bg-[#1a6b3a] hover:text-white transition-colors"
                          title="View order details"
                          aria-label="View order details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <a
                          href={replyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25d366] text-white hover:bg-[#20ba5a] text-xs font-bold transition-colors"
                          title="Reply to customer on WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5 fill-current" />
                          Reply
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Order Detail Modal ──────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#dce8d8] space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#dce8d8]">
              <div>
                <span className="font-mono text-xs font-bold text-[#1a6b3a] bg-[#e8f5ee] px-2 py-0.5 rounded-md">
                  {selectedOrder.order_ref}
                </span>
                <h2 className="text-xl font-bold font-heading text-[#1a2517] mt-1">
                  Order Details
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="bg-[#fdfbf5] p-4 rounded-2xl border border-[#dce8d8] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6b7c69]">Customer:</span>
                <span className="font-bold text-[#1a2517]">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7c69]">Phone:</span>
                <span className="font-mono font-semibold text-[#1a2517]">{selectedOrder.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7c69]">Address:</span>
                <span className="text-right font-medium text-[#1a2517] max-w-[240px]">
                  {selectedOrder.delivery_address} (Pin: {selectedOrder.pincode})
                </span>
              </div>
              {selectedOrder.landmark && (
                <div className="flex justify-between">
                  <span className="text-[#6b7c69]">Landmark:</span>
                  <span className="text-[#1a2517]">{selectedOrder.landmark}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#6b7c69]">Slot:</span>
                <span className="font-semibold text-[#1a6b3a]">{selectedOrder.delivery_slot}</span>
              </div>
              {selectedOrder.order_notes && (
                <div className="flex justify-between pt-1 border-t border-[#dce8d8]">
                  <span className="text-[#6b7c69]">Notes:</span>
                  <span className="italic text-[#1a2517]">{selectedOrder.order_notes}</span>
                </div>
              )}
            </div>

            {/* Itemized Basket */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7c69] mb-2">
                Purchased Groceries
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto divide-y divide-[#dce8d8]">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pt-2">
                    <div>
                      <p className="font-semibold text-[#1a2517]">{item.product_name}</p>
                      <p className="text-[11px] text-[#6b7c69]">
                        {item.quantity} × {item.unit_label}
                      </p>
                    </div>
                    <span className="font-bold text-[#1a2517]">
                      {formatPrice(item.line_total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Row */}
            <div className="border-t border-[#dce8d8] pt-3 flex justify-between items-center text-sm font-bold">
              <span>Total Payable (COD):</span>
              <span className="text-lg text-[#1a6b3a] font-heading">
                {formatPrice(selectedOrder.total)}
              </span>
            </div>

            {/* Status Update Actions */}
            <div className="pt-2 border-t border-[#dce8d8] space-y-2">
              <span className="text-xs font-bold text-[#6b7c69]">Update Order Status:</span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={selectedOrder.status === 'confirmed' ? 'primary' : 'outline'}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant={selectedOrder.status === 'delivered' ? 'primary' : 'outline'}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                >
                  Delivered
                </Button>
                <Button
                  size="sm"
                  variant={selectedOrder.status === 'cancelled' ? 'danger' : 'outline'}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
