import React from 'react'
import { IconButton } from '../components/buttons/IconButton'

export const IconButtonShowcase: React.FC = () => (
  <div className='space-y-4'>
    {/* Standard usage */}
    <IconButton
      icon='add'
      onClick={() => console.log('Standard button clicked')}
    />

    {/* Filled variant */}
    <IconButton
      icon='favorite'
      variant='filled'
      onClick={() => console.log('Filled button clicked')}
    />

    {/* Outlined variant */}
    <IconButton
      icon='delete'
      variant='outlined'
      onClick={() => console.log('Outlined button clicked')}
    />

    {/* Tonal variant */}
    <IconButton
      icon='edit'
      variant='tonal'
      onClick={() => console.log('Tonal button clicked')}
    />

    {/* Different sizes */}
    <div className='flex space-x-2'>
      <IconButton icon='search' size='small' />
      <IconButton icon='search' size='medium' />
      <IconButton icon='search' size='large' />
    </div>

    {/* Disabled state */}
    <IconButton
      icon='send'
      disabled
      onClick={() => console.log('This will not be called')}
    />

    {/* Selected state (for toggle-like behavior) */}
    <IconButton
      icon='star'
      selected
      onClick={() => console.log('Selected button clicked')}
    />

    {/* With custom class name */}
    <IconButton
      icon='settings'
      className='bg-purple-500 text-white'
      onClick={() => console.log('Custom styled button clicked')}
    />

    {/* With custom icon props */}
    <IconButton
      icon='notifications'
      iconProps={{ fill: 1, weight: 700 }}
      onClick={() => console.log('Button with custom icon props clicked')}
    />
  </div>
)
