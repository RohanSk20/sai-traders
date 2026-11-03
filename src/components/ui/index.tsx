import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  pill?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center' | 'right'
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}

export function SectionHeading({
  pill,
  title,
  subtitle,
  align = 'center',
  className,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  const alignClass = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[align]

  return (
    <div className={cn('flex flex-col gap-3', alignClass, className)}>
      {pill && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5ee] text-[#1a6b3a] text-sm font-semibold tracking-wide">
          <span aria-hidden="true">🌿</span>
          {pill}
        </span>
      )}
      <Tag className="font-heading text-[#1a2517]">{title}</Tag>
      {subtitle && (
        <p className="text-[#6b7c69] text-base max-w-2xl leading-relaxed">{subtitle}</p>
      )}
    </div>
  )
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex', className)}>
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        <li>
          <Link
            href="/"
            className="text-[#6b7c69] hover:text-[#1a6b3a] transition-colors flex items-center gap-1"
            aria-label="Home"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-[#6b7c69]" aria-hidden="true" />
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="text-[#6b7c69] hover:text-[#1a6b3a] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[#1a2517] font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// ─── Rating ───────────────────────────────────────────────────────────────────

interface RatingProps {
  value: number // 1-5
  maxValue?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  count?: number
  className?: string
}

export function Rating({ value, maxValue = 5, size = 'md', showValue, count, className }: RatingProps) {
  const starSize = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' }[size]

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center" role="img" aria-label={`Rating: ${value} out of ${maxValue} stars`}>
        {Array.from({ length: maxValue }, (_, i) => (
          <svg
            key={i}
            className={cn(starSize, i < Math.floor(value) ? 'text-[#f5c842]' : 'text-gray-200')}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {showValue && <span className="text-sm font-semibold text-[#1a2517]">{value}</span>}
      {count !== undefined && (
        <span className="text-sm text-[#6b7c69]">({count})</span>
      )}
    </div>
  )
}

// ─── Trust Badge ──────────────────────────────────────────────────────────────

interface TrustBadgeProps {
  icon: React.ReactNode
  label: string
  className?: string
}

export function TrustBadge({ icon, label, className }: TrustBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-8 h-8 rounded-full bg-[#e8f5ee] flex items-center justify-center text-[#1a6b3a] flex-shrink-0">
        {icon}
      </div>
      <span className="text-sm font-medium text-[#1a2517]">{label}</span>
    </div>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn('flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-[#dce8d8] shadow-[0_2px_8px_rgba(26,107,58,0.08)]', className)}>
      <div className="w-14 h-14 rounded-2xl bg-[#e8f5ee] flex items-center justify-center text-[#1a6b3a] mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#1a2517] mb-2">{title}</h3>
      <p className="text-sm text-[#6b7c69] leading-relaxed">{description}</p>
    </div>
  )
}

// ─── Category Card ────────────────────────────────────────────────────────────

import Image from 'next/image'
import type { Category } from '@/types'

interface CategoryCardProps {
  category: Category
  className?: string
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        'group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-[#dce8d8]',
        'hover:border-[#1a6b3a] hover:shadow-[0_4px_16px_rgba(26,107,58,0.15)]',
        'transition-all duration-200',
        className
      )}
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#f0f9f4]">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🛒
          </div>
        )}
      </div>
      <span className="text-sm font-semibold text-[#1a2517] group-hover:text-[#1a6b3a] transition-colors text-center">
        {category.name}
      </span>
    </Link>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#dce8d8] overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  )
}
