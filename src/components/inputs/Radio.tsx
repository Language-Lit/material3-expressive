export interface RadioProps {
  checked: boolean
  onChange: () => void
  name: string
}

export const Radio: React.FC<RadioProps> = ({
  checked,
  onChange,
  name,
}) => {
  return (
    <div className="relative inline-flex items-center justify-center w-40dp h-40dp">
      <input
        type='radio'
        name={name}
        checked={checked}
        onChange={onChange}
        className={`
          appearance-none
          w-20dp h-20dp
          rounded-[var(--md-sys-shape-corner-full)]
          border-2dp
          outline-none
          cursor-pointer
          transition-all duration-short-2
          relative
          
          // Unchecked state
          border-on-surface-variant
          hover:before:opacity-[var(--md-sys-state-hover-state-layer-opacity)]
          hover:before:bg-[var(--md-sys-color-on-surface)]
          
          // Checked state - outer circle
          checked:border-[var(--md-sys-color-primary)]
          checked:hover:before:bg-[var(--md-sys-color-primary)]
          
          // Checked state - inner circle
          after:content-['']
          after:absolute
          after:inset-0
          after:m-auto
          after:w-0 after:h-0
          after:rounded-[var(--md-sys-shape-corner-full)]
          after:bg-[var(--md-sys-color-primary)]
          after:transition-all
          after:duration-short-2
          checked:after:w-8dp
          checked:after:h-8dp
          
          // Focus state
          focus-visible:ring-2
          focus-visible:ring-primary
          focus-visible:ring-offset-2
          
          // Hover and focus overlay
          before:absolute
          before:inset-[-8dp]
          before:rounded-[var(--md-sys-shape-corner-full)]
          before:opacity-0
          before:transition-opacity
          before:duration-short-2
          
          // Disabled state (if needed)
          disabled:opacity-38
          disabled:cursor-not-allowed
        `}
      />
    </div>
  )
}
