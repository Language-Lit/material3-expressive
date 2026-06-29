import { useRef, useState } from 'react'
import { IconButton } from '../buttons/IconButton'
import { DropdownMenu } from './DropdownMenu'
import { MenuItem } from './MenuItem'
import { Icon, IconProps } from '../display/Icon'

export interface MenuAction {
  icon: IconProps['name']
  label: string
  onClick: (e: React.MouseEvent) => void
}

export interface MoreOptionsMenuProps {
  actions: MenuAction[]
  className?: string
}

export const MoreOptionsMenu = ({ actions, className }: MoreOptionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuAnchorRef = useRef<HTMLButtonElement>(null)

  return (
    <div className={className}>
      <IconButton
        ref={menuAnchorRef}
        icon='more_vert'
        variant='standard'
        size='small'
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(true)
        }}
        aria-label='More options'
      />
      <DropdownMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        anchorEl={menuAnchorRef.current}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={action.onClick}
            leadingIcon={<Icon name={action.icon} />}
          >
            {action.label}
          </MenuItem>
        ))}
      </DropdownMenu>
    </div>
  )
}
