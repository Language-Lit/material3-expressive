'use client'

import { cn } from '../../utils'
import { useMaterial3 } from '../../context/Material3Provider'
import { CardMenu } from './CardMenu'
import { CardContent } from './CardContent'
import { CardImage } from './CardImage'
import { CardProps } from './types'

export const Card = ({
  id,
  title,
  description,
  language,
  uploadedAt,
  linkPrefix = '/lessons',
  className,
  imageUrl,
  menuActions = [],
  showMenu = true,
  variant = 'lesson',
  isPriority = false,
  onMouseEnter,
}: CardProps) => {
  const { Link } = useMaterial3()

  return (
    <div
      onMouseEnter={onMouseEnter}
      className={cn(
        'block overflow-hidden w-full',
        variant === 'book' ? 'medium:max-w-48' : 'medium:max-w-80',
        'bg-[var(--md-sys-color-surface-container-highest)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'group relative select-none rounded-[var(--md-sys-shape-corner-medium)]',
        'before:content-[""] before:absolute before:inset-0 before:rounded-[var(--md-sys-shape-corner-medium)]',
        'before:bg-[var(--md-sys-color-on-surface)] before:opacity-0',
        'before:transition-opacity before:duration-200 before:pointer-events-none',
        'hover:before:opacity-[var(--md-sys-state-hover-state-layer-opacity)]',
        className
      )}
    >
      <Link href={`${linkPrefix}/${id}`} className='block' prefetch={true}>
        <CardImage
          imageUrl={imageUrl}
          title={title}
          isPriority={isPriority}
          variant={variant}
        />
        <CardContent
          title={title}
          description={description}
          language={language}
          uploadedAt={uploadedAt}
        />
      </Link>
      <CardMenu showMenu={showMenu} actions={menuActions} />
    </div>
  )
}
