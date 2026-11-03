'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  min?: number
  max?: number
  className?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  className,
  size = 'md',
  disabled = false,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-[#dce8d8] bg-white overflow-hidden',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      role="group"
      aria-label="Quantity"
    >
      <button
        onClick={onDecrement}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
        className={cn(
          'flex items-center justify-center text-[#1a6b3a] hover:bg-[#e8f5ee] transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
        )}
      >
        <Minus className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      </button>
      <span
        className={cn(
          'font-semibold text-[#1a2517] select-none min-w-[2rem] text-center',
          size === 'sm' ? 'text-sm' : 'text-base'
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
        className={cn(
          'flex items-center justify-center text-[#1a6b3a] hover:bg-[#e8f5ee] transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
        )}
      >
        <Plus className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      </button>
    </div>
  )
}
