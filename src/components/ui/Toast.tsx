'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const icons = {
  success: <CheckCircle className="h-5 w-5 text-[#2e7d32]" />,
  error: <XCircle className="h-5 w-5 text-[#c62828]" />,
  warning: <AlertCircle className="h-5 w-5 text-[#f57f17]" />,
  info: <Info className="h-5 w-5 text-[#1565c0]" />,
}

const toastStyles = {
  success: 'border-[#2e7d32] bg-[#e8f5ee]',
  error: 'border-[#c62828] bg-[#ffebee]',
  warning: 'border-[#f57f17] bg-[#fff8e1]',
  info: 'border-[#1565c0] bg-[#e8f0fe]',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true))

    // Auto-dismiss
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 3000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border-l-4 px-4 py-3 shadow-lg',
        'transition-all duration-300',
        'min-w-[280px] max-w-[380px]',
        toastStyles[toast.type],
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
      role="alert"
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm text-[#1a2517] font-medium">{toast.message}</p>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => onRemove(toast.id), 300)
        }}
        className="text-[#6b7c69] hover:text-[#1a2517] transition-colors flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
