import { tv } from 'tailwind-variants'

export const inputContainer = tv({
  base: [
    'relative',
    'w-full',
    'flex',
    'items-center',
    'transition-all',
    'duration-[var(--md-sys-motion-duration-medium2)]',
    'ease-standard',
    'cursor-text',
  ],
  variants: {
    variant: {
      filled: [
        'bg-[var(--md-sys-color-surface-container-high)]',
        'rounded-t-[var(--md-sys-shape-corner-extra-small)]',
        'h-56dp',
        'px-16dp',
        'pb-8dp',
        'pt-8dp',
      ],
      outlined: [
        'bg-[var(--md-sys-color-surface)]',
        'border',
        'border-[var(--md-sys-color-outline)]',
        'rounded-[var(--md-sys-shape-corner-extra-small)]',
        'h-56dp',
        'px-16dp',
      ],
    },
    hasLeadingIcon: {
      true: 'pl-12dp',
    },
    hasTrailingIcon: {
      true: 'pr-12dp',
    },
    focused: {
      true: '',
    },
  },
  compoundVariants: [
    {
      variant: 'outlined',
      focused: true,
      class: 'border-2 border-[var(--md-sys-color-primary)]',
    },
  ],
  defaultVariants: {
    variant: 'filled',
    hasLeadingIcon: false,
    hasTrailingIcon: false,
    focused: false,
  },
})

export const inputWrapper = tv({
  base: [
    'h-full',
    'flex',
    'flex-col',
    'flex-grow',
    'transition-all',
    'duration-[var(--md-sys-motion-duration-medium1)]',
    'ease-standard',
  ],
  variants: {
    variant: {
      filled: 'justify-end',
      outlined: 'justify-center',
    },
  },
  defaultVariants: {
    variant: 'filled',
  },
})

export const inputField = tv({
  base: [
    'w-full',
    'bg-transparent',
    'focus:outline-none',
    'placeholder-[var(--md-sys-color-on-surface-variant)]',
    'text-[var(--md-sys-color-on-surface)]',
    'text-body-large',
    'caret-[var(--md-sys-color-primary)]',
  ],
  variants: {
    variant: {
      filled: '',
      outlined: '',
    },
    error: {
      true: 'caret-[var(--md-sys-color-error)]',
    },
  },
  defaultVariants: {
    variant: 'filled',
    error: false,
  },
})

export const inputLabel = tv({
  base: [
    'absolute',
    'transition-all',
    'duration-[var(--md-sys-motion-duration-medium2)]',
    'ease-standard',
    'pointer-events-none',
    'text-[var(--md-sys-color-on-surface-variant)]',
    'transform',
    'origin-left',
    'text-body-large',
  ],
  variants: {
    variant: {
      filled: '',
      outlined: 'px-4dp',
    },
    focused: {
      true: 'text-[var(--md-sys-color-primary)] scale-75 -translate-y-1.5',
      false: 'top-1/2 -translate-y-1/2 scale-100',
    },
    hasLeadingIcon: {
      true: 'left-[52px]',
      false: 'left-16dp',
    },
  },
  compoundVariants: [
    {
      variant: 'outlined',
      focused: true,
      class: '-top-8dp bg-[var(--md-sys-color-surface)]',
    },
    {
      variant: 'filled',
      focused: true,
      class: 'top-8dp',
    },
  ],
  defaultVariants: {
    variant: 'filled',
    focused: false,
    hasLeadingIcon: false,
  },
})

export const inputIcon = tv({
  base: 'text-[var(--md-sys-color-on-surface-variant)]',
  variants: {
    position: {
      left: 'mr-16dp',
      right: 'ml-16dp',
    },
    variant: {
      filled: '',
      outlined: '',
    },
    focused: {
      true: '',
    },
  },
})

export const inputBottomIndicator = tv({
  base: 'absolute bottom-0 left-0 w-full h-[1px] bg-[var(--md-sys-color-on-surface-variant)]',
})

export const inputBottomIndicatorBar = tv({
  base: [
    'h-[2px]',
    'bg-[var(--md-sys-color-primary)]',
    'transform',
    'origin-center',
    'scale-x-0',
    'transition-transform',
    'duration-[var(--md-sys-motion-duration-medium2)]',
    'ease-standard',
  ],
  variants: {
    focused: {
      true: 'scale-x-100',
    },
  },
})

export const inputSupportingText = tv({
  base: 'mt-4dp text-body-small text-[var(--md-sys-color-on-surface-variant)]',
  variants: {
    variant: {
      filled: '',
      outlined: '',
    },
    focused: {
      true: '',
    },
  },
})

export const inputRoot = tv({
  base: 'mb-24dp',
})
