import React from 'react'
import { Text } from '../components/display/Text'

export const Typography = () => (
  <div className='space-y-48dp'>
    {/* Material 3 Expressive Typography Overview */}
    <section className='p-32dp bg-[var(--md-sys-color-surface-container-low)] rounded-[24px]'>
      <Text type='headline' className='text-[var(--md-sys-color-primary)] mb-12dp'>
        Material 3 Expressive Typography
      </Text>
      <Text type='body'>
        The Material 3 type scale includes 30 type styles: 15 baseline and 15 emphasized.
        Use emphasized styles for selection, actions, headlines, and other editorial treatments
        requiring higher emphasis. Both sets are designed to be used together.
      </Text>
    </section>

    {/* Display Styles */}
    <section className='p-32dp space-y-24dp'>
      <Text type='title' size='large' className='text-[var(--md-sys-color-primary)]'>Display Styles</Text>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='display'>Display Large</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='display' emphasis='emphasized'>Display Large Emphasized</Text>
        </div>
      </div>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='display' size='medium'>Display Medium</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='display' size='medium' emphasis='emphasized'>Display Medium Emphasized</Text>
        </div>
      </div>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='display' size='small'>Display Small</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='display' size='small' emphasis='emphasized'>Display Small Emphasized</Text>
        </div>
      </div>
    </section>

    {/* Headline Styles */}
    <section className='p-32dp space-y-24dp bg-[var(--md-sys-color-surface-container-lowest)]'>
      <Text type='title' size='large' className='text-[var(--md-sys-color-primary)]'>Headline Styles</Text>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='headline'>Headline Large</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='headline' emphasis='emphasized'>Headline Large Emphasized</Text>
        </div>
      </div>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='headline' size='medium'>Headline Medium</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='headline' size='medium' emphasis='emphasized'>Headline Medium Emphasized</Text>
        </div>
      </div>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='headline' size='small'>Headline Small</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='headline' size='small' emphasis='emphasized'>Headline Small Emphasized</Text>
        </div>
      </div>
    </section>

    {/* Title Styles */}
    <section className='p-32dp space-y-24dp'>
      <Text type='title' size='large' className='text-[var(--md-sys-color-primary)]'>Title Styles</Text>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='title'>Title Large</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='title' emphasis='emphasized'>Title Large Emphasized</Text>
        </div>
      </div>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='title' size='medium'>Title Medium</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='title' size='medium' emphasis='emphasized'>Title Medium Emphasized</Text>
        </div>
      </div>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='title' size='small'>Title Small</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='title' size='small' emphasis='emphasized'>Title Small Emphasized</Text>
        </div>
      </div>
    </section>

    {/* Body Styles */}
    <section className='p-32dp space-y-24dp bg-[var(--md-sys-color-surface-container-lowest)]'>
      <Text type='title' size='large' className='text-[var(--md-sys-color-primary)]'>Body Styles</Text>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text>
            Body Large: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text emphasis='emphasized'>
            Body Large Emphasized: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </div>
      </div>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text size='medium'>
            Body Medium: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text size='medium' emphasis='emphasized'>
            Body Medium Emphasized: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </div>
      </div>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text size='small'>
            Body Small: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text size='small' emphasis='emphasized'>
            Body Small Emphasized: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </div>
      </div>
    </section>

    {/* Label Styles */}
    <section className='p-32dp space-y-24dp'>
      <Text type='title' size='large' className='text-[var(--md-sys-color-primary)]'>Label Styles</Text>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='label'>Label Large</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='label' emphasis='emphasized'>Label Large Emphasized</Text>
        </div>
      </div>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='label' size='medium'>Label Medium</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='label' size='medium' emphasis='emphasized'>Label Medium Emphasized</Text>
        </div>
      </div>
      <div className='space-y-16dp'>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>BASELINE</Text>
          <Text type='label' size='small'>Label Small</Text>
        </div>
        <div>
          <Text type='label' size='small' className='text-[var(--md-sys-color-on-surface-variant)] mb-4dp'>EMPHASIZED</Text>
          <Text type='label' size='small' emphasis='emphasized'>Label Small Emphasized</Text>
        </div>
      </div>
    </section>

    {/* Use Cases Section */}
    <section className='p-32dp space-y-24dp bg-[var(--md-sys-color-surface-container-low)] rounded-[24px]'>
      <Text type='title' size='large' className='text-[var(--md-sys-color-primary)]'>When to Use Emphasized Styles</Text>
      <div className='space-y-12dp'>
        <div>
          <Text type='label' emphasis='emphasized' className='text-[var(--md-sys-color-tertiary)]'>Components</Text>
          <Text type='body' size='medium'>
            Use in badges, buttons (for primary actions), extended FABs, selected list items,
            and selected menu items to communicate hierarchy or importance.
          </Text>
        </div>
        <div>
          <Text type='label' emphasis='emphasized' className='text-[var(--md-sys-color-tertiary)]'>Context</Text>
          <Text type='body' size='medium'>
            Draw attention to specific aspects like selected states, unread messages,
            or key interactions requiring user attention.
          </Text>
        </div>
        <div>
          <Text type='label' emphasis='emphasized' className='text-[var(--md-sys-color-tertiary)]'>Editorial</Text>
          <Text type='body' size='medium'>
            Use for headlines, pull quotes, highlighted text, and other editorial treatments
            where expressive typography enhances the content.
          </Text>
        </div>
      </div>
    </section>
  </div>
)
