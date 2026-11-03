import React from 'react'
import { cn } from '@/lib/utils'

// ─── Input ────────────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#1a2517] mb-1.5"
          >
            {label}
            {props.required && <span className="text-[#c62828] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c69]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-xl border bg-white px-4 py-2.5 text-[#1a2517] placeholder:text-[#6b7c69] text-base',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#1a6b3a] focus:ring-offset-0 focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
              error
                ? 'border-[#c62828] focus:ring-[#c62828]'
                : 'border-[#dce8d8] hover:border-[#8ccbaa]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7c69]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-[#c62828]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-sm text-[#6b7c69]">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#1a2517] mb-1.5">
            {label}
            {props.required && <span className="text-[#c62828] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-[#1a2517] placeholder:text-[#6b7c69] text-base resize-none',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#1a6b3a] focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-[#c62828]' : 'border-[#dce8d8] hover:border-[#8ccbaa]',
            className
          )}
          rows={props.rows || 3}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[#c62828]">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-[#6b7c69]">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ─── Select ───────────────────────────────────────────────────────────────────

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#1a2517] mb-1.5">
            {label}
            {props.required && <span className="text-[#c62828] ml-0.5">*</span>}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-[#1a2517] text-base appearance-none cursor-pointer',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#1a6b3a] focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-[#c62828]' : 'border-[#dce8d8] hover:border-[#8ccbaa]',
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-[#c62828]">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-[#6b7c69]">{hint}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// ─── Checkbox ─────────────────────────────────────────────────────────────────

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <label
        htmlFor={inputId}
        className="inline-flex items-center gap-2 cursor-pointer group"
      >
        <input
          type="checkbox"
          id={inputId}
          ref={ref}
          className={cn(
            'h-4 w-4 rounded border-[#dce8d8] text-[#1a6b3a] cursor-pointer',
            'focus:ring-2 focus:ring-[#1a6b3a] focus:ring-offset-0',
            'transition-all duration-150',
            className
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-[#1a2517] group-hover:text-[#1a6b3a] transition-colors">
            {label}
          </span>
        )}
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'

// ─── SearchBar ────────────────────────────────────────────────────────────────

export interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search products...',
  className,
  size = 'md',
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch((e.target as HTMLInputElement).value)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c69] h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-full border border-[#dce8d8] bg-white text-[#1a2517] placeholder:text-[#6b7c69]',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#1a6b3a] focus:border-transparent',
          'hover:border-[#8ccbaa]',
          size === 'sm' && 'h-8 pl-9 pr-3 text-sm',
          size === 'md' && 'h-10 pl-10 pr-4 text-base',
          size === 'lg' && 'h-12 pl-12 pr-5 text-lg',
        )}
        aria-label={placeholder}
      />
    </div>
  )
}
