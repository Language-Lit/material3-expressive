import { cva, VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const circularProgressVariants = cva(
  'relative inline-flex items-center justify-center rounded-[var(--md-sys-shape-corner-full)]',
  {
    variants: {
      size: {
        sm: 'w-32dp h-32dp',
        md: 'w-48dp h-48dp',
        lg: 'w-64dp h-64dp',
      },
      variant: {
        primary: 'text-[var(--md-sys-color-primary)]',
        secondary: 'text-[var(--md-sys-color-secondary)]',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
)

export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof circularProgressVariants> {
  value?: number
  max?: number
  indeterminate?: boolean
  bg?: boolean
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  max = 100,
  indeterminate = false,
  size,
  variant,
  className,
  bg = false,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const strokeWidth = 4 // 4dp stroke width
  const radius = 42 // Adjusted to account for stroke width
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (circumference * percentage) / 100

  const renderDeterminate = () => (
    <svg className='w-full h-full' viewBox='0 0 96 96'>
      <circle
        className='text-[var(--md-sys-color-surface-container-highest)]'
        strokeWidth={strokeWidth}
        stroke='currentColor'
        fill='transparent'
        r={radius}
        cx='48'
        cy='48'
      />
      <circle
        className='origin-center -rotate-90'
        strokeWidth={strokeWidth}
        stroke='currentColor'
        fill='transparent'
        r={radius}
        cx='48'
        cy='48'
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
      />
    </svg>
  )

  const renderIndeterminate = () => (
    <div className='absolute inset-0 animate-[linear-rotate_1568ms_linear_infinite]'>
      <div className='absolute inset-0 animate-[rotate-arc_5332ms_var(--md-sys-motion-easing-legacy)_infinite]'>
        <div className='absolute inset-[0_0_0_50%] overflow-hidden'>
          <div className='absolute inset-[0_0_0_-100%] box-border border-solid border-[calc(var(--md-circular-progress-size)_*_0.1)] rounded-[var(--md-sys-shape-corner-full)] rotate-[100deg] border-r-transparent border-b-transparent animate-[expand-arc_1333ms_var(--md-sys-motion-easing-legacy)_infinite_-666.5ms] border-t-current border-l-current' />
        </div>
      </div>
    </div>
  )

  return (
    <div
      className={twMerge(
        circularProgressVariants({ size, variant }), 
        bg ? 'bg-[var(--md-sys-color-surface-container-high)]' : '',
        className
      )}
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : value}
      {...props}
    >
      {indeterminate ? renderIndeterminate() : renderDeterminate()}
      {!indeterminate && (
        <span className='absolute font-[var(--md-sys-typescale-body-small-weight)] text-[length:var(--md-sys-typescale-body-small-size)] leading-[var(--md-sys-typescale-body-small-line-height)] tracking-[var(--md-sys-typescale-body-small-tracking)]'>{Math.round(percentage)}%</span>
      )}
    </div>
  )
}
