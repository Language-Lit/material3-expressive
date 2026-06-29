import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as LibraryExports from '../index'

/**
 * Feature: material3-expressive-lib
 * Property 1: All Generic Components Exported
 *
 * *For any* component in the defined generic component list (Button, FAB, IconButton,
 * Card, NavigationBar, Input, Checkbox, CircularProgress, Dialog, Icon, Text, etc.),
 * importing from the library's main entry point shall successfully resolve that component.
 *
 * **Validates: Requirements 1.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
 */
describe('Property 1: All Generic Components Exported', () => {
  // Button components (Requirement 3.1)
  const buttonComponents = [
    'Button',
    'FAB',
    'IconButton',
    'RippleButton',
  ] as const

  // Navigation components (Requirement 3.3)
  const navigationComponents = [
    'NavigationBar',
    'NavigationDrawer',
    'NavigationRail',
    'NavigationItem',
    'Tabs',
    'TabItem',
    'TabsContainer',
    'Select',
    'SelectItem',
    'DropdownMenu',
    'MenuItem',
    'MenuDivider',
    'MenuList',
    'MoreOptionsMenu',
  ] as const

  // Input components (Requirement 3.4)
  const inputComponents = [
    'Input',
    'TextArea',
    'Checkbox',
    'Radio',
    'Switch',
    'SegmentedButtons',
  ] as const

  // Feedback components (Requirement 3.5)
  const feedbackComponents = [
    'CircularProgress',
    'LinearProgress',
    'EmptyState',
    'HorizontalEmptyState',
  ] as const

  // Modal components (Requirement 3.6)
  const modalComponents = [
    'Dialog',
    'Modal',
  ] as const

  // Display components (Requirement 3.7)
  const displayComponents = [
    'Icon',
    'Text',
    'Carousel',
    'CarouselCard',
    'BentoGrid',
    'ScrollProgress',
    'Flag',
    'ImageComponent',
  ] as const

  // All generic components combined
  const allGenericComponents = [
    ...buttonComponents,
    ...navigationComponents,
    ...inputComponents,
    ...feedbackComponents,
    ...modalComponents,
    ...displayComponents,
  ] as const

  it('should export all button components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...buttonComponents),
        (componentName) => {
          expect(LibraryExports).toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should export all navigation components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...navigationComponents),
        (componentName) => {
          expect(LibraryExports).toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should export all input components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...inputComponents),
        (componentName) => {
          expect(LibraryExports).toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should export all feedback components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...feedbackComponents),
        (componentName) => {
          expect(LibraryExports).toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should export all modal components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...modalComponents),
        (componentName) => {
          expect(LibraryExports).toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should export all display components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...displayComponents),
        (componentName) => {
          expect(LibraryExports).toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should export all generic components from main entry point', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allGenericComponents),
        (componentName) => {
          // Component must exist in exports
          expect(LibraryExports).toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: material3-expressive-lib
 * Property 2: Application-Specific Components Excluded
 *
 * *For any* component in the defined application-specific list (SubscribeButton,
 * LogoutButton, LanguageSelector, ContextGeneratorModal, etc.), that component
 * shall NOT be exported from the library's main entry point.
 *
 * **Validates: Requirements 3.8, 4.1, 4.2, 4.3, 4.4, 4.5**
 */
describe('Property 2: Application-Specific Components Excluded', () => {
  // Application-specific button components (Requirement 4.1)
  const appSpecificButtons = [
    'SubscribeButton',
    'LogoutButton',
    'SaveButton',
    'DeleteButton',
    'EditButton',
    'PlayButton',
    'TutorialButton',
    'ContextButton',
  ] as const

  // Application-specific modal components (Requirement 4.2)
  const appSpecificModals = [
    'ContextGeneratorModal',
    'ErrorDialog',
    'ImageDialog',
    'SubscriptionRequiredModal',
  ] as const

  // Application-specific input components (Requirement 4.3)
  const appSpecificInputs = [
    'LanguageDropdown',
    'LanguageSelector',
    'TimezoneSelector',
    'UserIdInput',
  ] as const

  // Application-specific feedback components (Requirement 4.4)
  const appSpecificFeedback = [
    'TimeTooltip',
    'TutorialTip',
  ] as const

  // Application-specific display components (Requirement 4.5)
  const appSpecificDisplay = [
    'DonutChart',
    'FollowerPointerElement',
  ] as const

  // All application-specific components combined
  const allAppSpecificComponents = [
    ...appSpecificButtons,
    ...appSpecificModals,
    ...appSpecificInputs,
    ...appSpecificFeedback,
    ...appSpecificDisplay,
  ] as const

  it('should NOT export application-specific button components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...appSpecificButtons),
        (componentName) => {
          expect(LibraryExports).not.toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should NOT export application-specific modal components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...appSpecificModals),
        (componentName) => {
          expect(LibraryExports).not.toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should NOT export application-specific input components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...appSpecificInputs),
        (componentName) => {
          expect(LibraryExports).not.toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should NOT export application-specific feedback components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...appSpecificFeedback),
        (componentName) => {
          expect(LibraryExports).not.toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should NOT export application-specific display components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...appSpecificDisplay),
        (componentName) => {
          expect(LibraryExports).not.toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should NOT export any application-specific components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allAppSpecificComponents),
        (componentName) => {
          // Application-specific component must NOT exist in exports
          expect(LibraryExports).not.toHaveProperty(componentName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
