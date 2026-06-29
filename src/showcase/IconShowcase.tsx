import React from 'react'
import { Icon } from '../components/display/Icon'

/**
 * Showcase component demonstrating Icon component variants and states.
 * Uses inline styles for color scheme backgrounds since Wrapper is app-specific.
 */
export const IconShowcase = () => (
  <div className='flex flex-wrap'>
    {/* Primary */}
    <div 
      className='inline-flex gap-4 p-8dp mb-8dp'
      style={{ 
        backgroundColor: 'var(--md-sys-color-primary)', 
        color: 'var(--md-sys-color-on-primary)' 
      }}
    >
      <Icon name='check_circle' className='text-4xl hover:icon-fill-1 hover:icon-wght-600' />
      <Icon name='home' fill={1} weight={700} grad={200} opsz={48} className='text-4xl' />
      <Icon name='settings' className='text-4xl hover:icon-fill-1' />
      <Icon name='add' className='text-4xl icon-wght-100 hover:icon-wght-700' />
    </div>

    {/* Secondary */}
    <div 
      className='inline-flex gap-4 p-8dp mb-8dp'
      style={{ 
        backgroundColor: 'var(--md-sys-color-secondary)', 
        color: 'var(--md-sys-color-on-secondary)' 
      }}
    >
      <Icon name='check_circle' className='text-4xl hover:icon-fill-1 hover:icon-wght-600' />
      <Icon name='home' fill={1} weight={700} grad={200} opsz={48} className='text-4xl' />
      <Icon name='settings' className='text-4xl hover:icon-fill-1' />
      <Icon name='add' className='text-4xl icon-wght-100 hover:icon-wght-700' />
    </div>

    {/* Tertiary */}
    <div 
      className='inline-flex gap-4 p-8dp mb-8dp'
      style={{ 
        backgroundColor: 'var(--md-sys-color-tertiary)', 
        color: 'var(--md-sys-color-on-tertiary)' 
      }}
    >
      <Icon name='check_circle' className='text-4xl hover:icon-fill-1 hover:icon-wght-600' />
      <Icon name='home' fill={1} weight={700} grad={200} opsz={48} className='text-4xl' />
      <Icon name='settings' className='text-4xl hover:icon-fill-1' />
      <Icon name='add' className='text-4xl icon-wght-100 hover:icon-wght-700' />
    </div>

    {/* Error */}
    <div 
      className='inline-flex gap-4 p-8dp mb-8dp'
      style={{ 
        backgroundColor: 'var(--md-sys-color-error)', 
        color: 'var(--md-sys-color-on-error)' 
      }}
    >
      <Icon name='check_circle' className='text-4xl hover:icon-fill-1 hover:icon-wght-600' />
      <Icon name='home' fill={1} weight={700} grad={200} opsz={48} className='text-4xl' />
      <Icon name='settings' className='text-4xl hover:icon-fill-1' />
      <Icon name='add' className='text-4xl icon-wght-100 hover:icon-wght-700' />
    </div>

    {/* Error Container */}
    <div 
      className='inline-flex gap-4 p-8dp mb-8dp'
      style={{ 
        backgroundColor: 'var(--md-sys-color-error-container)', 
        color: 'var(--md-sys-color-on-error-container)' 
      }}
    >
      <Icon name='check_circle' className='text-4xl hover:icon-fill-1 hover:icon-wght-600' />
      <Icon name='home' fill={1} weight={700} grad={200} opsz={48} className='text-4xl' />
      <Icon name='settings' className='text-4xl hover:icon-fill-1' />
      <Icon name='add' className='text-4xl icon-wght-100 hover:icon-wght-700' />
    </div>

    {/* Primary Container */}
    <div 
      className='inline-flex gap-4 p-8dp mb-8dp'
      style={{ 
        backgroundColor: 'var(--md-sys-color-primary-container)', 
        color: 'var(--md-sys-color-on-primary-container)' 
      }}
    >
      <Icon name='check_circle' className='text-4xl hover:icon-fill-1 hover:icon-wght-600' />
      <Icon name='home' fill={1} weight={700} grad={200} opsz={48} className='text-4xl' />
      <Icon name='settings' className='text-4xl hover:icon-fill-1' />
      <Icon name='add' className='text-4xl icon-wght-100 hover:icon-wght-700' />
    </div>

    {/* Secondary Container */}
    <div 
      className='inline-flex gap-4 p-8dp mb-8dp'
      style={{ 
        backgroundColor: 'var(--md-sys-color-secondary-container)', 
        color: 'var(--md-sys-color-on-secondary-container)' 
      }}
    >
      <Icon name='check_circle' className='text-4xl hover:icon-fill-1 hover:icon-wght-600' />
      <Icon name='home' fill={1} weight={700} grad={200} opsz={48} className='text-4xl' />
      <Icon name='settings' className='text-4xl hover:icon-fill-1' />
      <Icon name='add' className='text-4xl icon-wght-100 hover:icon-wght-700' />
    </div>

    {/* Tertiary Container */}
    <div 
      className='inline-flex gap-4 p-8dp mb-8dp'
      style={{ 
        backgroundColor: 'var(--md-sys-color-tertiary-container)', 
        color: 'var(--md-sys-color-on-tertiary-container)' 
      }}
    >
      <Icon name='check_circle' className='text-4xl hover:icon-fill-1 hover:icon-wght-600' />
      <Icon name='home' fill={1} weight={700} grad={200} opsz={48} className='text-4xl' />
      <Icon name='settings' className='text-4xl hover:icon-fill-1' />
      <Icon name='add' className='text-4xl icon-wght-100 hover:icon-wght-700' />
    </div>

    {/* Surface Container High */}
    <div 
      className='inline-flex gap-4 p-8dp mb-8dp'
      style={{ 
        backgroundColor: 'var(--md-sys-color-surface-container-high)', 
        color: 'var(--md-sys-color-on-surface)' 
      }}
    >
      <Icon name='check_circle' className='text-4xl hover:icon-fill-1 hover:icon-wght-600' />
      <Icon name='home' fill={1} weight={700} grad={200} opsz={48} className='text-4xl' />
      <Icon name='settings' className='text-4xl hover:icon-fill-1' />
      <Icon name='add' className='text-4xl icon-wght-100 hover:icon-wght-700' />
    </div>

    {/* Inverse Surface */}
    <div 
      className='inline-flex gap-4 p-8dp mb-8dp'
      style={{ 
        backgroundColor: 'var(--md-sys-color-inverse-surface)', 
        color: 'var(--md-sys-color-inverse-on-surface)' 
      }}
    >
      <Icon name='check_circle' className='text-4xl hover:icon-fill-1 hover:icon-wght-600' />
      <Icon name='home' fill={1} weight={700} grad={200} opsz={48} className='text-4xl' />
      <Icon name='settings' className='text-4xl hover:icon-fill-1' />
      <Icon name='add' className='text-4xl icon-wght-100 hover:icon-wght-700' />
    </div>
  </div>
)
