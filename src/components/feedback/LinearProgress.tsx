import { cva, VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const linearProgressVariants = cva(
  'relative overflow-hidden rounded-[var(--md-sys-shape-corner-full)]',
  {
    variants: {
      size: {
        sm: 'h-2dp',
        md: 'h-4dp',
        lg: 'h-8dp',
      },
      variant: {
        primary: 'bg-[var(--md-sys-color-surface-container-highest)]',
        secondary: 'bg-[var(--md-sys-color-surface-container-high)]',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
)

export interface LinearProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof linearProgressVariants> {
  value?: number
  max?: number
  indeterminate?: boolean
  buffer?: number
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  value = 0,
  max = 100,
  indeterminate = false,
  buffer,
  size,
  variant,
  className,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const bufferPercentage = buffer !== undefined
    ? Math.min(100, Math.max(0, (buffer / max) * 100))
    : 100

  return (
    <div
      className={twMerge(linearProgressVariants({ size, variant }), className)}
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : value}
      {...props}
    >
      {!indeterminate && (
        <div
          className='absolute top-0 left-0 h-full bg-[var(--md-sys-color-surface-container)] transition-all duration-medium-4 ease-standard'
          style={{ width: `${bufferPercentage}%` }}
        />
      )}
      <div
        className={`absolute top-0 left-0 h-full bg-[var(--md-sys-color-primary)] transition-all duration-medium-4 ease-standard ${
          indeterminate ? 'animate-indeterminate' : ''
        }`}
        style={{ width: indeterminate ? '100%' : `${percentage}%` }}
      />
    </div>
  )
}
