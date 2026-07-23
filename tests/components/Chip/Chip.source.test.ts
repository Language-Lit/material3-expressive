import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultTokenSet } from '../../../src/tokens'

const componentSource = readFileSync(
  fileURLToPath(new URL('../../../src/components/Chip/Chip.tsx', import.meta.url)),
  'utf8',
)
const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/Chip/Chip.css', import.meta.url)),
  'utf8',
)

const split = (source: string) => source.trim().split(/\s+/)

/**
 * Frozen inventory of every generated role at the pinned AndroidX revision.
 * `read` mirrors literal `*Tokens.*` references in Chip.kt; the complement is
 * deliberately unread rather than being turned into fictitious web states.
 */
const sourceTokenLedger = {
  AssistChip: {
    declarations: split(`
      ContainerHeight ContainerShape DisabledLabelTextColor DisabledLabelTextOpacity
      DraggedContainerElevation DraggedLabelTextColor ElevatedContainerColor
      ElevatedContainerElevation ElevatedDisabledContainerColor
      ElevatedDisabledContainerElevation ElevatedDisabledContainerOpacity
      ElevatedFocusContainerElevation ElevatedHoverContainerElevation
      ElevatedPressedContainerElevation FlatContainerElevation
      FlatDisabledOutlineColor FlatDisabledOutlineOpacity FlatFocusOutlineColor
      FlatOutlineColor FlatOutlineWidth FocusIndicatorColor FocusLabelTextColor
      HoverLabelTextColor LabelTextColor LabelTextFont PressedLabelTextColor
      DisabledIconColor DisabledIconOpacity DraggedIconColor FocusIconColor
      HoverIconColor IconColor IconSize PressedIconColor
    `),
    read: split(`
      ContainerHeight ContainerShape DisabledIconColor DisabledIconOpacity
      DisabledLabelTextColor DisabledLabelTextOpacity DraggedContainerElevation
      ElevatedContainerColor ElevatedContainerElevation
      ElevatedDisabledContainerColor ElevatedDisabledContainerElevation
      ElevatedDisabledContainerOpacity ElevatedFocusContainerElevation
      ElevatedHoverContainerElevation ElevatedPressedContainerElevation
      FlatContainerElevation FlatDisabledOutlineColor FlatDisabledOutlineOpacity
      FlatOutlineColor FlatOutlineWidth IconColor IconSize LabelTextColor LabelTextFont
    `),
  },
  FilterChip: {
    declarations: split(`
      ContainerHeight ContainerShape DisabledLabelTextColor DisabledLabelTextOpacity
      DraggedContainerElevation ElevatedContainerElevation
      ElevatedDisabledContainerColor ElevatedDisabledContainerElevation
      ElevatedDisabledContainerOpacity ElevatedFocusContainerElevation
      ElevatedHoverContainerElevation ElevatedPressedContainerElevation
      ElevatedSelectedContainerColor ElevatedUnselectedContainerColor
      FlatContainerElevation FlatDisabledSelectedContainerColor
      FlatDisabledSelectedContainerOpacity FlatDisabledUnselectedOutlineColor
      FlatDisabledUnselectedOutlineOpacity FlatSelectedContainerColor
      FlatSelectedFocusContainerElevation FlatSelectedHoverContainerElevation
      FlatSelectedOutlineWidth FlatSelectedPressedContainerElevation
      FlatUnselectedFocusContainerElevation FlatUnselectedFocusOutlineColor
      FlatUnselectedHoverContainerElevation FlatUnselectedOutlineColor
      FlatUnselectedOutlineWidth FlatUnselectedPressedContainerElevation
      FocusIndicatorColor LabelTextFont SelectedDraggedLabelTextColor
      SelectedFocusLabelTextColor SelectedHoverLabelTextColor SelectedLabelTextColor
      SelectedPressedLabelTextColor UnselectedDraggedLabelTextColor
      UnselectedFocusLabelTextColor UnselectedHoverLabelTextColor
      UnselectedLabelTextColor UnselectedPressedLabelTextColor IconSize
      DisabledLeadingIconColor DisabledLeadingIconOpacity
      SelectedDraggedLeadingIconColor SelectedFocusLeadingIconColor
      SelectedHoverLeadingIconColor SelectedLeadingIconColor
      SelectedPressedLeadingIconColor UnselectedDraggedLeadingIconColor
      UnselectedFocusLeadingIconColor UnselectedHoverLeadingIconColor
      UnselectedLeadingIconColor UnselectedPressedLeadingIconColor
      DisabledTrailingIconColor DisabledTrailingIconOpacity
      SelectedDraggedTrailingIconColor SelectedFocusTrailingIconColor
      SelectedHoverTrailingIconColor SelectedPressedTrailingIconColor
      SelectedTrailingIconColor UnselectedDraggedTrailingIconColor
      UnselectedFocusTrailingIconColor UnselectedHoverTrailingIconColor
      UnselectedPressedTrailingIconColor UnselectedTrailingIconColor
    `),
    read: split(`
      ContainerHeight ContainerShape DisabledLabelTextColor DisabledLabelTextOpacity
      DisabledLeadingIconColor DisabledLeadingIconOpacity DisabledTrailingIconColor
      DisabledTrailingIconOpacity DraggedContainerElevation ElevatedContainerElevation
      ElevatedDisabledContainerColor ElevatedDisabledContainerElevation
      ElevatedDisabledContainerOpacity ElevatedFocusContainerElevation
      ElevatedHoverContainerElevation ElevatedPressedContainerElevation
      ElevatedSelectedContainerColor ElevatedUnselectedContainerColor
      FlatContainerElevation FlatDisabledSelectedContainerColor
      FlatDisabledSelectedContainerOpacity FlatDisabledUnselectedOutlineColor
      FlatDisabledUnselectedOutlineOpacity FlatSelectedContainerColor
      FlatSelectedFocusContainerElevation FlatSelectedHoverContainerElevation
      FlatSelectedOutlineWidth FlatSelectedPressedContainerElevation
      FlatUnselectedOutlineColor FlatUnselectedOutlineWidth IconSize LabelTextFont
      SelectedLabelTextColor SelectedLeadingIconColor SelectedTrailingIconColor
      UnselectedLabelTextColor UnselectedLeadingIconColor UnselectedTrailingIconColor
    `),
  },
  InputChip: {
    declarations: split(`
      ContainerElevation ContainerHeight ContainerShape DisabledLabelTextColor
      DisabledLabelTextOpacity DisabledSelectedContainerColor
      DisabledSelectedContainerOpacity DisabledUnselectedOutlineColor
      DisabledUnselectedOutlineOpacity DraggedContainerElevation FocusIndicatorColor
      LabelTextFont SelectedContainerColor SelectedDraggedLabelTextColor
      SelectedFocusLabelTextColor SelectedHoverLabelTextColor SelectedLabelTextColor
      SelectedOutlineWidth SelectedPressedLabelTextColor UnselectedDraggedLabelTextColor
      UnselectedFocusLabelTextColor UnselectedFocusOutlineColor
      UnselectedHoverLabelTextColor UnselectedLabelTextColor UnselectedOutlineColor
      UnselectedOutlineWidth UnselectedPressedLabelTextColor AvatarShape AvatarSize
      DisabledAvatarOpacity DisabledLeadingIconColor DisabledLeadingIconOpacity
      LeadingIconSize SelectedDraggedLeadingIconColor SelectedFocusLeadingIconColor
      SelectedHoverLeadingIconColor SelectedLeadingIconColor
      SelectedPressedLeadingIconColor UnselectedDraggedLeadingIconColor
      UnselectedFocusLeadingIconColor UnselectedHoverLeadingIconColor
      UnselectedLeadingIconColor UnselectedPressedLeadingIconColor
      DisabledTrailingIconColor DisabledTrailingIconOpacity
      SelectedDraggedTrailingIconColor SelectedFocusTrailingIconColor
      SelectedHoverTrailingIconColor SelectedPressedTrailingIconColor
      SelectedTrailingIconColor TrailingIconSize UnselectedDraggedTrailingIconColor
      UnselectedFocusTrailingIconColor UnselectedHoverTrailingIconColor
      UnselectedPressedTrailingIconColor UnselectedTrailingIconColor
    `),
    read: split(`
      AvatarShape AvatarSize ContainerElevation ContainerHeight ContainerShape
      DisabledAvatarOpacity DisabledLabelTextColor DisabledLabelTextOpacity
      DisabledLeadingIconColor DisabledLeadingIconOpacity
      DisabledSelectedContainerColor DisabledSelectedContainerOpacity
      DisabledTrailingIconColor DisabledTrailingIconOpacity
      DisabledUnselectedOutlineColor DisabledUnselectedOutlineOpacity
      DraggedContainerElevation LabelTextFont LeadingIconSize SelectedContainerColor
      SelectedLabelTextColor SelectedLeadingIconColor SelectedOutlineWidth
      SelectedTrailingIconColor UnselectedLabelTextColor UnselectedLeadingIconColor
      UnselectedOutlineColor UnselectedOutlineWidth UnselectedTrailingIconColor
    `),
  },
  SuggestionChip: {
    declarations: split(`
      ContainerHeight ContainerShape DisabledLabelTextColor DisabledLabelTextOpacity
      DraggedContainerElevation DraggedLabelTextColor ElevatedContainerColor
      ElevatedContainerElevation ElevatedDisabledContainerColor
      ElevatedDisabledContainerElevation ElevatedDisabledContainerOpacity
      ElevatedFocusContainerElevation ElevatedHoverContainerElevation
      ElevatedPressedContainerElevation FlatContainerElevation
      FlatDisabledOutlineColor FlatDisabledOutlineOpacity FlatFocusOutlineColor
      FlatOutlineColor FlatOutlineWidth FocusIndicatorColor FocusLabelTextColor
      HoverLabelTextColor LabelTextColor LabelTextFont PressedLabelTextColor
      DisabledLeadingIconColor DisabledLeadingIconOpacity DraggedLeadingIconColor
      FocusLeadingIconColor HoverLeadingIconColor LeadingIconColor LeadingIconSize
      PressedLeadingIconColor
    `),
    read: split(`
      ContainerHeight ContainerShape DisabledLabelTextColor DisabledLabelTextOpacity
      DisabledLeadingIconColor DisabledLeadingIconOpacity
      DraggedContainerElevation ElevatedContainerColor ElevatedContainerElevation
      ElevatedDisabledContainerColor ElevatedDisabledContainerElevation
      ElevatedFocusContainerElevation ElevatedHoverContainerElevation
      ElevatedPressedContainerElevation FlatContainerElevation
      FlatDisabledOutlineColor FlatDisabledOutlineOpacity FlatOutlineColor
      FlatOutlineWidth LabelTextColor LabelTextFont LeadingIconColor LeadingIconSize
    `),
  },
  Chips: {
    declarations: split(`
      AvatarShape AvatarSize ContainerElevation DisabledLabelTextColor
      DisabledLeadingIconColor DisabledTrailingIconColor DraggedContainerElevation
      FocusedIndicatorColor Height LabelText LeadingIconSize PressedShape
      SelectedContainerColor SelectedDisabledContainerColor
      SelectedDisabledContainerOpacity SelectedLabelTextColor
      SelectedLeadingIconColor SelectedOutlineWidth SelectedShape
      SelectedTrailingIconColor TrailingIconSize UnselectedDisabledOutlineColor
      UnselectedDisabledOutlineOpacity UnselectedLabelTextColor
      UnselectedLeadingIconColor UnselectedOutlineColor UnselectedOutlineWidth
      UnselectedShape UnselectedTrailingIconColor
    `),
    read: split(`
      PressedShape SelectedShape UnselectedLeadingIconColor UnselectedShape
    `),
  },
} as const

const expectedUnreadCounts = {
  AssistChip: 10,
  FilterChip: 29,
  InputChip: 27,
  SuggestionChip: 11,
  Chips: 25,
} as const

const sourceSurfaceLedger = [
  'AssistChip',
  'ElevatedAssistChip',
  'FilterChip(shape)',
  'FilterChip(shapes)',
  'ElevatedFilterChip(shape)',
  'ElevatedFilterChip(shapes)',
  'InputChip(shape)',
  'InputChip(shapes)',
  'SuggestionChip',
  'ElevatedSuggestionChip',
  'AssistChipDefaults',
  'FilterChipDefaults',
  'InputChipDefaults',
  'SuggestionChipDefaults',
  'ChipColors',
  'SelectableChipColors',
  'ChipElevation',
  'SelectableChipElevation',
  'ChipShapes',
] as const

const deprecatedSourceSurfaceLedger = [
  'AssistChip(binary overload 1)',
  'AssistChip(binary overload 2)',
  'ElevatedAssistChip(binary overload 1)',
  'ElevatedAssistChip(binary overload 2)',
  'FilterChip(binary overload)',
  'ElevatedFilterChip(binary overload)',
  'InputChip(binary overload)',
  'SuggestionChip(binary overload 1)',
  'SuggestionChip(binary overload 2)',
  'ElevatedSuggestionChip(binary overload 1)',
  'ElevatedSuggestionChip(binary overload 2)',
  'AssistChipDefaults.assistChipBorder(ChipBorder)',
  'SuggestionChipDefaults.suggestionChipBorder(ChipBorder)',
  'ChipBorder',
] as const

const pinnedSourceAnomalies = [
  'elevatedAssistChipColors-custom-overload-copies-suggestion-defaults',
  'elevatedSuggestion-disabled-container-opacity-reads-assist-token',
  'elevatedSuggestion-disabled-icon-reads-assist-token',
  'elevatedFilter-disabled-trailing-opacity-reads-leading-opacity-token',
  'ChipElevation-equality-omits-draggedElevation',
  'SelectableChipElevation-equality-omits-draggedElevation',
  'color-resolvers-TODO-other-interaction-states',
  'standard-and-expressive-slot-motion-TODO-correct-tokens',
] as const

const pinnedBehaviorTests = split(`
  defaultSemantics_assistChip disabledSemantics_assistChip onClick_assistChip
  heightIsFromSpec_assistChip horizontalPadding_assistChip
  horizontalPadding_assistChip_withLeadingIcon horizontalPadding_assistChip_customWidth
  horizontalPadding_assistChip_withContentPaddingAndSpacing labelContentColor_assistChip
  elevatedDisabled_assistChip unselectedSemantics_filterChip selectedSemantics_filterChip
  disabledSemantics_filterChip toggle_filterChip horizontalPadding_unselected_filterChip
  horizontalPadding_selected_filterChip horizontalPadding_filterChip_withIcons
  horizontalPadding_filterChip_withContentPaddingAndSpacing heightIsFromSpec_filterChip
  correctDimensionsInScrollableRow_filterChip intrinsicSize_filterChip
  longLabelDoesNotHideTrailingIcon_filterChip labelContentColor_unselectedFilterChip
  labelContentColor_selectedFilterChip defaultColors_elevatedFilterChip
  defaultSemantics_inputChip unselectedSemantics_inputChip selectedSemantics_inputChip
  disabledSemantics_inputChip toggle_inputChip heightIsFromSpec_inputChip
  horizontalPadding_inputChip horizontalPadding_inputChip_withLeadingIcon
  horizontalPadding_inputChip_withAvatar
  horizontalPadding_inputChip_withContentPaddingAndSpacing labelContentColor_inputChip
  defaultSemantics_suggestionChip disabledSemantics_suggestionChip onClick_suggestionChip
  heightIsFromSpec_suggestionChip horizontalPadding_suggestionChip
  horizontalPadding_suggestionChip_withLeadingIcon
  horizontalPadding_suggestionChip_withContentPaddingAndSpacing
  labelContentColor_suggestionChip elevatedDisabled_suggestionChip canBeDisabled
  withLargeFontSizeIsLargerThenHeight propagateDefaultTextStyle contentIsRow
  clickableInMinimumTouchTarget expressiveFilterChip_arrangement_noIcons
  expressiveFilterChip_arrangement_leadingIcon
  expressiveFilterChip_arrangement_trailingIcon expressiveFilterChip_arrangement_bothIcons
  expressiveFilterChip_largeWidth_trailingIconPlacement
  expressiveInputChip_arrangement_noIcons expressiveInputChip_arrangement_leadingIcon
  expressiveInputChip_arrangement_avatar expressiveInputChip_arrangement_trailingIcon
`)

const pinnedScreenshotTests = split(`
  assistChip_flat_lightTheme assistChip_flat_darkTheme assistChip_elevated_lightTheme
  assistChip_elevated_darkTheme assistChip_flat_disabled_lightTheme
  assistChip_elevated_disabled_lightTheme inputChip_lightTheme
  inputChip_selected_lightTheme inputChip_withAvatar_lightTheme inputChip_darkTheme
  inputChip_selected_darkTheme inputChip_disabled_lightTheme
  inputChip_disabled_selected_lightTheme inputChip_disabled_darkTheme
  inputChip_disabled_selected_darkTheme filterChip_flat_selected_lightTheme
  filterChip_flat_notSelected filterChip_flat_disabled_selected
  filterChip_flat_disabled_notSelected filterChip_elevated_selected_darkTheme
  filterChip_shapes_selected_lightTheme filterChip_shapes_notSelected_lightTheme
  elevatedFilterChip_shapes_selected_darkTheme
  elevatedFilterChip_shapes_notSelected_darkTheme inputChip_shapes_selected_lightTheme
  inputChip_shapes_notSelected_lightTheme inputChip_shapes_selected_darkTheme
  inputChip_shapes_notSelected_darkTheme suggestionChip_flat_lightTheme
  suggestionChip_flat_darkTheme suggestionChip_elevated_lightTheme
  suggestionChip_elevated_darkTheme suggestionChip_flat_disabled_lightTheme
  suggestionChip_elevated_disabled_lightTheme
`)

describe('Chip pinned-source completeness ledger', () => {
  it('freezes every generated role as literally read or intentionally unread', () => {
    for (const [family, ledger] of Object.entries(sourceTokenLedger)) {
      const declared = new Set(ledger.declarations)
      const read = new Set(ledger.read)
      const unread = ledger.declarations.filter((role) => !read.has(role))

      expect(declared.size, `${family} declarations must be unique`).toBe(
        ledger.declarations.length,
      )
      expect(read.size, `${family} reads must be unique`).toBe(ledger.read.length)
      expect([...read].every((role) => declared.has(role))).toBe(true)
      expect(unread).toHaveLength(
        expectedUnreadCounts[family as keyof typeof expectedUnreadCounts],
      )
      expect(read.size + unread.length).toBe(declared.size)
    }
  })

  it('accounts for every non-deprecated public composable/default/value class', () => {
    expect(sourceSurfaceLedger).toHaveLength(19)
    expect(new Set(sourceSurfaceLedger).size).toBe(sourceSurfaceLedger.length)
    expect(deprecatedSourceSurfaceLedger).toHaveLength(14)
    expect(new Set(deprecatedSourceSurfaceLedger).size).toBe(
      deprecatedSourceSurfaceLedger.length,
    )
    expect(pinnedSourceAnomalies).toHaveLength(8)
    expect(new Set(pinnedSourceAnomalies).size).toBe(pinnedSourceAnomalies.length)
    expect(componentSource).toContain("requestedKind === 'assist'")
    expect(componentSource).toContain("requestedKind === 'filter'")
    expect(componentSource).toContain("requestedKind === 'input'")
    expect(componentSource).toContain("requestedKind === 'suggestion'")
    expect(componentSource).toContain("requestedVariant === 'elevated'")
    expect(componentSource).toContain("requestedShape = 'standard'")
    expect(componentSource).toContain('useControllableState')
    expect(componentSource).toContain('useRetainedSlot')
  })

  it('freezes every pinned behavior and screenshot case as an audited input', () => {
    expect(pinnedBehaviorTests).toHaveLength(59)
    expect(new Set(pinnedBehaviorTests).size).toBe(59)
    expect(pinnedScreenshotTests).toHaveLength(34)
    expect(new Set(pinnedScreenshotTests).size).toBe(34)

    expect(pinnedBehaviorTests).toContain('clickableInMinimumTouchTarget')
    expect(pinnedBehaviorTests).toContain('longLabelDoesNotHideTrailingIcon_filterChip')
    expect(pinnedBehaviorTests).toContain('expressiveInputChip_arrangement_avatar')
    expect(pinnedScreenshotTests).toContain('inputChip_disabled_selected_darkTheme')
    expect(pinnedScreenshotTests).toContain('elevatedFilterChip_shapes_notSelected_darkTheme')
  })

  it('pins source identity and registers only observable resolution paths', () => {
    const registration = defaultTokenSet.componentTokens.find(
      (candidate) => candidate.component === 'chip',
    )

    expect(registration?.task).toBe('T38')
    expect(registration?.source).toEqual({
      id: 'androidx-material3-chip',
      url: 'https://android.googlesource.com/platform/frameworks/support/+/225f50d42bf0adeb2abf4b6109befb5ab6ce4efc/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Chip.kt',
      revision: '225f50d42bf0adeb2abf4b6109befb5ab6ce4efc',
      accessed: '2026-07-23',
    })
    expect(registration?.tokens).not.toHaveProperty('assist-hover-label-color')
    expect(registration?.tokens).not.toHaveProperty('filter-selected-hover-label-color')
    expect(registration?.tokens).not.toHaveProperty('chips-height')
  })

  it('preserves the pinned implementation’s cross-family suggestion reads', () => {
    expect(css).toContain('--m3e-comp-chip-assist-disabled-icon-color')
    expect(css).toContain('--m3e-comp-chip-assist-disabled-icon-opacity')
    expect(css).toContain('--m3e-comp-chip-suggestion-disabled-icon-color')
    expect(css).toContain('--m3e-comp-chip-suggestion-disabled-icon-opacity')
    expect(css).toContain('--m3e-comp-chip-assist-elevated-disabled-container-opacity')
    expect(css).toContain('--m3e-comp-chip-filter-disabled-leading-icon-opacity')
    expect(css).not.toContain(
      '--m3e-comp-chip-suggestion-elevated-disabled-container-opacity',
    )
  })

  it('keeps every observable geometry, state, and motion translation searchable', () => {
    for (const marker of [
      '--m3e-comp-chip-container-height',
      '--m3e-comp-chip-minimum-interactive-target',
      '--m3e-comp-chip-maximum-width',
      '--m3e-comp-chip-icon-size',
      '--m3e-comp-chip-avatar-size',
      '--m3e-comp-chip-horizontal-spacing',
      '--m3e-comp-chip-compact-horizontal-spacing',
      '--m3e-comp-chip-input-padding-start',
      '--m3e-comp-chip-expressive-unselected-shape',
      '--m3e-comp-chip-expressive-selected-shape',
      '--m3e-comp-chip-expressive-pressed-shape',
      '[data-m3e-selected="true"]',
      '[data-m3e-dragged="true"]',
      '[data-m3e-visible="false"]',
      'prefers-reduced-motion',
      'forced-colors',
    ]) {
      expect(css).toContain(marker)
    }
  })
})
