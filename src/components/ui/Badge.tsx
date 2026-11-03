import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
  {
    variants: {
      variant: {
        organic: 'bg-[#e8f5ee] text-[#1a6b3a] border border-[#8ccbaa]',
        sale: 'bg-[#f5c842] text-[#1a2517]',
        'out-of-stock': 'bg-gray-100 text-gray-500 border border-gray-200',
        new: 'bg-[#e8f0fe] text-[#1a237e] border border-[#9fa8da]',
        featured: 'bg-[#fff3e0] text-[#e65100] border border-[#ffcc80]',
        success: 'bg-[#e8f5ee] text-[#2e7d32]',
        warning: 'bg-[#fff8e1] text-[#f57f17]',
        error: 'bg-[#ffebee] text-[#c62828]',
      },
    },
    defaultVariants: {
      variant: 'organic',
    },
  }
)

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export function Badge({ variant, children, className, icon }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}
