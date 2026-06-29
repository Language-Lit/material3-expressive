import React from 'react'
import { Text } from '../components/display/Text'

/**
 * Showcase component demonstrating Material 3 color scheme combinations.
 * Uses inline styles to demonstrate color schemes since Wrapper is app-specific.
 */
export const WrapperShowcase = () => (
  <>
    <div 
      className='p-4 mb-4 rounded-[var(--md-sys-shape-corner-large)] inline-flex'
      style={{ 
        backgroundColor: 'var(--md-sys-color-primary)', 
        color: 'var(--md-sys-color-on-primary)' 
      }}
    >
      <Text type='headline' size='large'>on-primary</Text>
    </div>

    <div 
      className='p-4 mb-4 rounded-[var(--md-sys-shape-corner-large)] inline-flex'
      style={{ 
        backgroundColor: 'var(--md-sys-color-secondary)', 
        color: 'var(--md-sys-color-on-secondary)' 
      }}
    >
      <Text type='headline' size='large'>on-secondary</Text>
    </div>

    <div 
      className='p-4 mb-4 rounded-[var(--md-sys-shape-corner-large)] inline-flex'
      style={{ 
        backgroundColor: 'var(--md-sys-color-tertiary)', 
        color: 'var(--md-sys-color-on-tertiary)' 
      }}
    >
      <Text type='headline' size='large'>on-tertiary</Text>
    </div>

    <div className='h-8' />

    <div 
      className='p-4 mb-4 rounded-[var(--md-sys-shape-corner-large)] inline-flex'
      style={{ 
        backgroundColor: 'var(--md-sys-color-error)', 
        color: 'var(--md-sys-color-on-error)' 
      }}
    >
      <Text type='headline' size='large'>on-error</Text>
    </div>

    <div 
      className='p-4 mb-4 rounded-[var(--md-sys-shape-corner-large)] inline-flex'
      style={{ 
        backgroundColor: 'var(--md-sys-color-error-container)', 
        color: 'var(--md-sys-color-on-error-container)' 
      }}
    >
      <Text type='headline' size='large'>on-error-container</Text>
    </div>

    <div className='h-8' />

    <div 
      className='p-4 mb-4 rounded-[var(--md-sys-shape-corner-large)] inline-flex'
      style={{ 
        backgroundColor: 'var(--md-sys-color-primary-container)', 
        color: 'var(--md-sys-color-on-primary-container)' 
      }}
    >
      <Text type='headline' size='large'>on-primary-container</Text>
    </div>

    <div 
      className='p-4 mb-4 rounded-[var(--md-sys-shape-corner-large)] inline-flex'
      style={{ 
        backgroundColor: 'var(--md-sys-color-secondary-container)', 
        color: 'var(--md-sys-color-on-secondary-container)' 
      }}
    >
      <Text type='headline' size='large'>on-secondary-container</Text>
    </div>

    <div 
      className='p-4 mb-4 rounded-[var(--md-sys-shape-corner-large)] inline-flex'
      style={{ 
        backgroundColor: 'var(--md-sys-color-tertiary-container)', 
        color: 'var(--md-sys-color-on-tertiary-container)' 
      }}
    >
      <Text type='headline' size='large'>on-tertiary-container</Text>
    </div>

    <div className='h-8' />

    <div 
      className='p-4 mb-4 rounded-[var(--md-sys-shape-corner-large)] inline-flex'
      style={{ 
        backgroundColor: 'var(--md-sys-color-surface-container-high)', 
        color: 'var(--md-sys-color-on-surface)' 
      }}
    >
      <Text type='headline' size='large'>on-surface</Text>
    </div>

    <div 
      className='p-4 mb-4 rounded-[var(--md-sys-shape-corner-large)] inline-flex'
      style={{ 
        backgroundColor: 'var(--md-sys-color-inverse-surface)', 
        color: 'var(--md-sys-color-inverse-on-surface)' 
      }}
    >
      <Text type='headline' size='large'>inverse-on-surface</Text>
    </div>
  </>
)
