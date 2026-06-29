import { tv } from 'tailwind-variants'

// ============================================================================
// Menu Variants
// ============================================================================

export const menuVariants = tv({
  base: 'z-[60] rounded-[var(--md-sys-shape-corner-small)] max-h-[336px] overflow-y-auto shadow-md border outline-none will-change-transform [contain:layout_style_paint]',
  variants: {
    surface: {
      default: 'bg-[var(--md-sys-color-surface-container-high)] border-[var(--md-sys-color-outline-variant)]',
      elevated: 'bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)]',
    },
  },
  defaultVariants: {
    surface: 'default',
  },
})

// ============================================================================
// MenuItem Variants
// ============================================================================

export const menuItemVariants = tv({
  slots: {
    base: [
      'w-full text-left',
      'p-16dp',
      'flex items-center',
      'transition-colors duration-[var(--md-sys-motion-duration-short2)]',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)]',
    ],
    text: 'flex-grow flex items-center',
    icon: 'flex items-center',
  },
  variants: {
    state: {
      default: {
        base: 'hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer',
        text: 'text-[var(--md-sys-color-on-surface)]',
        icon: 'text-[var(--md-sys-color-on-surface-variant)]',
      },
      selected: {
        base: 'bg-[var(--md-sys-color-secondary-container)] hover:bg-[var(--md-sys-color-secondary-container)]',
        text: 'text-[var(--md-sys-color-on-secondary-container)]',
        icon: 'text-[var(--md-sys-color-on-secondary-container)]',
      },
      disabled: {
        base: 'opacity-[0.38] cursor-not-allowed',
        text: 'text-[var(--md-sys-color-on-surface)]',
        icon: 'text-[var(--md-sys-color-on-surface-variant)]',
      },
      focused: {
        base: 'bg-[var(--md-sys-color-surface-container-highest)]',
        text: 'text-[var(--md-sys-color-on-surface)]',
        icon: 'text-[var(--md-sys-color-on-surface-variant)]',
      },
    },
    intent: {
      default: {},
      destructive: {
        text: 'text-[var(--md-sys-color-error)]',
        icon: 'text-[var(--md-sys-color-error)]',
      },
    },
    iconPosition: {
      leading: {
        icon: 'mr-16dp',
      },
      trailing: {
        icon: 'ml-16dp',
      },
    },
  },
  defaultVariants: {
    state: 'default',
    intent: 'default',
  },
})

// ============================================================================
// Select Button Variants (for LanguageSelector trigger)
// ============================================================================

export const selectButtonVariants = tv({
  slots: {
    base: [
      'w-full p-16dp',
      'rounded-[var(--md-sys-shape-corner-small)]',
      'bg-[var(--md-sys-color-surface-container-highest)]',
      'flex items-center justify-between',
      'cursor-pointer',
      'transition-colors duration-[var(--md-sys-motion-duration-medium2)]',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)]',
    ],
    content: 'flex items-center flex-grow',
    divider: 'border-l border-[var(--md-sys-color-outline-variant)] pl-16dp ml-16dp flex items-center',
    icon: 'text-[var(--md-sys-color-on-surface-variant)]',
  },
  variants: {
    isOpen: {
      true: {
        base: 'bg-[var(--md-sys-color-surface-container-high)]',
      },
      false: {
        base: 'hover:bg-[var(--md-sys-color-surface-container-high)]',
      },
    },
    hasValue: {
      true: {},
      false: {},
    },
  },
  defaultVariants: {
    isOpen: false,
    hasValue: false,
  },
})
