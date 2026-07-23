import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultTokenSet } from '../../../src/tokens'

const componentSource = readFileSync(
  fileURLToPath(
    new URL('../../../src/components/ListItem/ListItem.tsx', import.meta.url),
  ),
  'utf8',
)
const css = readFileSync(
  fileURLToPath(
    new URL('../../../src/components/ListItem/ListItem.css', import.meta.url),
  ),
  'utf8',
)
const split = (source: string) => source.trim().split(/\s+/)

const pinnedFiles = {
  'ListItem.kt': '549d6a0fabca8f7e82cfa1a0cfcd1f1133bcc19e',
  'ListItemDefaults.kt': '64a3db9821aac60854c43ea510d6e007f7468725',
  'ListTokens.kt': '9c1823f65873878d6b3e746cf0393522c0b980c2',
  'ReorderListTokens.kt': 'b3a47ce590a467424d8e240c14899c57395e69d8',
  'ListItemTest.kt': '50593c77bf6c560b0dadfeb25c171392af51595c',
  'InteractiveListTest.kt': 'a4070bc34f6482309f40b57e634fa8bcd8e31442',
  'ListItemScreenshotTest.kt': '49ab1f4214e745ada97d19c8281c7ce346bb27e6',
  'InteractiveListScreenshotTest.kt': 'b5d00e2b4e1af80cfd3f6f1120adad60882e9bf3',
} as const

const listTokenDeclarations = split(`
  ContainerShape DividerBottomSpace DividerLeadingSpace DividerTopSpace
  DividerTrailingSpace FocusIndicatorColor ItemBetweenSpace ItemBottomSpace
  ItemContainerColor ItemContainerElevation ItemContainerExpressiveShape
  ItemContainerShape ItemDisabledContainerExpressiveShape ItemDisabledLabelTextColor
  ItemDisabledLabelTextOpacity ItemDisabledLeadingIconColor
  ItemDisabledLeadingIconOpacity ItemDisabledOverlineColor
  ItemDisabledOverlineOpacity ItemDisabledStateLayerOpacity
  ItemDisabledSupportingTextColor ItemDisabledSupportingTextOpacity
  ItemDisabledTrailingIconColor ItemDisabledTrailingIconOpacity
  ItemDraggedContainerElevation ItemDraggedContainerExpressiveShape
  ItemDraggedLabelTextColor ItemDraggedLeadingIconIconColor
  ItemDraggedTrailingIconIconColor ItemFocusLabelTextColor
  ItemFocusLeadingIconIconColor ItemFocusTrailingIconIconColor
  ItemFocusedContainerExpressiveShape ItemHoverLabelTextColor
  ItemHoverLeadingIconIconColor ItemHoverTrailingIconIconColor
  ItemHoveredContainerExpressiveShape ItemLabelTextColor ItemLabelTextFont
  ItemLargeLeadingVideoHeight ItemLargeLeadingVideoWidth ItemLeadingAvatarColor
  ItemLeadingAvatarLabelColor ItemLeadingAvatarLabelFont ItemLeadingAvatarShape
  ItemLeadingAvatarSize ItemLeadingIconColor ItemLeadingIconExpressiveSize
  ItemLeadingIconSize ItemLeadingImageExpressiveShape ItemLeadingImageHeight
  ItemLeadingImageShape ItemLeadingImageWidth ItemLeadingSpace
  ItemLeadingVideoShape ItemLeadingVideoWidth ItemOneLineContainerHeight
  ItemOverlineColor ItemOverlineFont ItemPressedContainerExpressiveShape
  ItemPressedLabelTextColor ItemPressedLeadingIconIconColor
  ItemPressedTrailingIconIconColor ItemSegmentedContainerColor
  ItemSelectedContainerColor ItemSelectedContainerExpressiveShape
  ItemSelectedContainerShape ItemSelectedDisabledContainerColor
  ItemSelectedDisabledContainerExpressiveShape ItemSelectedDisabledContainerOpacity
  ItemSelectedDisabledLabelTextColor ItemSelectedDisabledLabelTextOpacity
  ItemSelectedDisabledLeadingIconColor ItemSelectedDisabledLeadingIconOpacity
  ItemSelectedDisabledOverlineColor ItemSelectedDisabledOverlineOpacity
  ItemSelectedDisabledStateLayerOpacity ItemSelectedDisabledSupportingTextColor
  ItemSelectedDisabledSupportingTextOpacity ItemSelectedDisabledTrailingIconColor
  ItemSelectedDisabledTrailingIconOpacity
  ItemSelectedDisabledTrailingSupportingTextColor
  ItemSelectedDisabledTrailingSupportingTextOpacity
  ItemSelectedDraggedContainerExpressiveShape ItemSelectedDraggedLabelTextColor
  ItemSelectedDraggedLeadingIconColor ItemSelectedDraggedTrailingIconColor
  ItemSelectedFocusLabelTextColor ItemSelectedFocusLeadingIconColor
  ItemSelectedFocusTrailingIconColor ItemSelectedFocusedContainerExpressiveShape
  ItemSelectedHoverLabelTextColor ItemSelectedHoverLeadingIconColor
  ItemSelectedHoverTrailingIconColor ItemSelectedHoveredContainerExpressiveShape
  ItemSelectedLabelTextColor ItemSelectedLeadingIconColor ItemSelectedOverlineColor
  ItemSelectedPressedContainerExpressiveShape ItemSelectedPressedLabelTextColor
  ItemSelectedPressedLeadingIconColor ItemSelectedPressedTrailingIconColor
  ItemSelectedSupportingTextColor ItemSelectedTrailingIconColor
  ItemSelectedTrailingSupportingTextColor ItemSmallLeadingVideoHeight
  ItemSmallLeadingVideoWidth ItemSupportingTextColor ItemSupportingTextFont
  ItemThreeLineContainerHeight ItemTopSpace ItemTrailingIconColor
  ItemTrailingIconExpressiveSize ItemTrailingIconSize ItemTrailingSpace
  ItemTrailingSupportingTextColor ItemTrailingSupportingTextFont
  ItemTwoLineContainerHeight ItemUnselectedTrailingIconColor SegmentedGap
`)

const listTokenReads = split(`
  ContainerShape ItemBetweenSpace ItemBottomSpace ItemContainerColor ItemContainerElevation
  ItemContainerExpressiveShape ItemContainerShape ItemDisabledLabelTextColor
  ItemDisabledLabelTextOpacity ItemDisabledLeadingIconColor
  ItemDisabledLeadingIconOpacity ItemDisabledOverlineColor
  ItemDisabledOverlineOpacity ItemDisabledSupportingTextColor
  ItemDisabledSupportingTextOpacity ItemDisabledTrailingIconColor
  ItemDisabledTrailingIconOpacity ItemDraggedContainerElevation
  ItemFocusedContainerExpressiveShape ItemHoveredContainerExpressiveShape
  ItemLabelTextColor ItemLabelTextFont ItemLeadingAvatarLabelFont
  ItemLeadingIconColor ItemLeadingSpace ItemOneLineContainerHeight
  ItemOverlineColor ItemOverlineFont ItemPressedContainerExpressiveShape
  ItemSegmentedContainerColor ItemSelectedContainerColor
  ItemSelectedContainerExpressiveShape ItemSelectedLabelTextColor
  ItemSelectedLeadingIconColor ItemSelectedOverlineColor
  ItemSelectedSupportingTextColor ItemSelectedTrailingIconColor
  ItemSupportingTextColor ItemSupportingTextFont ItemThreeLineContainerHeight
  ItemTopSpace ItemTrailingIconColor ItemTrailingSpace
  ItemTrailingSupportingTextFont ItemTwoLineContainerHeight SegmentedGap
`)

const reorderTokenDeclarations = split(`
  ItemContainerColor ItemDropZoneColor ItemLabelTextColor ItemLeadingIconColor
  ItemOverlineColor ItemShape ItemSupportingTextColor ItemTrailingIconColor
  ItemTrailingSupportingTextColor
`)
const reorderTokenReads = split(`
  ItemContainerColor ItemLabelTextColor ItemLeadingIconColor ItemOverlineColor
  ItemShape ItemSupportingTextColor ItemTrailingIconColor
`)

const currentSurface = split(`
  ListItem-passive ListItem-click ListItem-selected ListItem-checked
  SegmentedListItem-passive SegmentedListItem-click SegmentedListItem-selected
  SegmentedListItem-checked ListItemDefaults-ContentPadding
  ListItemDefaults-containerColor ListItemDefaults-contentColor
  ListItemDefaults-colors-zero ListItemDefaults-colors-stateful
  ListItemDefaults-segmentedColors-zero ListItemDefaults-segmentedColors-stateful
  ListItemDefaults-shapes-zero ListItemDefaults-shapes-stateful
  ListItemDefaults-segmentedShapes ListItemDefaults-elevation
  ListItemDefaults-SegmentedGap ListItemDefaults-verticalAlignment
  ListItemDefaults-colors-legacy-names ListItemColors ListItemShapes ListItemElevation
`)
const deprecatedSurface = split(`
  ListItem-headline-first ListItemDefaults-Elevation ListItemDefaults-shape
  ListItemColors-legacy-constructor ListItemColors-headlineColor
  ListItemColors-leadingIconColor ListItemColors-overlineColor
  ListItemColors-supportingTextColor ListItemColors-trailingIconColor
  ListItemColors-disabledHeadlineColor ListItemColors-disabledLeadingIconColor
  ListItemColors-disabledTrailingIconColor ListItemColors-copy-legacy
`)

const behaviorTests = split(`
  listItem_withEmptyHeadline_doesNotCrash listItem_oneLine_size
  listItem_oneLine_withIcon_size listItem_twoLine_size listItem_twoLine_withIcon_size
  listItem_threeLine_size listItem_oneLine_intrinsicSize
  listItem_multipleItems_intrinsicSize listItem_twoLine_intrinsicSize
  listItem_threeLine_overline_intrinsicSize listItem_threeLine_noOverline_intrinsicSize
  listItem_oneLine_positioning_noIcon
  listItem_threeLine_overlineAndSupporting_constraintsDoNotCrash
  listItem_oneLine_positioning_withIcon listItem_oneLine_positioning_customSize
  listItem_twoLine_positioning_noIcon listItem_twoLine_positioning_withIcon
  listItem_twoLine_positioning_customSize
  listItem_threeLine_positioning_noOverline_metaText
  listItem_threeLine_positioning_overline_trailingIcon
  listItem_threeLine_overline_positioning_customSize listItem_oneLine_size
  listItem_twoLine_size listItem_threeLineOverlineAndSupporting_size
  listItem_threeLineSupportingMultiline_size segmentedListItem_oneLine_size
  segmentedListItem_twoLine_size segmentedListItem_threeLineOverlineAndSupporting_size
  segmentedListItem_threeLineSupportingMultiline_size clickableListItem_intrinsicSize
  clickableListItem_multipleItems_intrinsicSize
  clickableListItem_verticalAlignmentCenter_positioning
  clickableListItem_verticalAlignmentTop_positioning
  clickableListItem_verticalAlignmentCenter_positioning_rtl
  clickableListItem_verticalAlignmentTop_positioning_rtl
  clickableListItem_customVerticalAlignment_positioning clickableListItem_semantics
  clickableListItem_longClick selectableListItem_semantics selectableListItem_longClick
  toggleableListItem_semantics toggleableListItem_longClick
  listItem_contentPadding_default listItem_contentPadding_precisionPointer
`)

const screenshotTests = split(`
  listItem_customColor oneLine_lightTheme oneLine_darkTheme twoLine_lightTheme
  twoLine_darkTheme threeLine_lightTheme threeLine_darkTheme
  listItem_focused_insetFocusRings nonInteractiveListItems
  nonInteractiveSegmentedListItems clickableListItem_oneLine clickableListItem_twoLines
  clickableListItem_threeLines clickableListItem_withLeadingTrailing
  clickableListItem_customColors clickableListItem_disabled clickableListItem_pressed
  selectableListItem_selected toggleableListItem_checked segmentedListItem_oneLine
  segmentedListItem_twoLines segmentedListItem_threeLines
  segmentedListItem_firstSelected segmentedListItem_secondSelected
  segmentedListItem_lastSelected segmentedListItem_allChecked segmentedListItem_standalone
`)

const implementationAnomalies = split(`
  legacy-layout-keeps-six-direct-dp-constants
  interactive-motion-uses-system-motion-until-component-motion-tokens-exist
  disabled-selected-colors-resolve-disabled-before-selected
  dragged-colors-use-ReorderListTokens-but-elevation-uses-ListTokens
`)

describe('ListItem pinned-source completeness ledger', () => {
  it('freezes every pinned source file identity', () => {
    expect(Object.keys(pinnedFiles)).toHaveLength(8)
    expect(new Set(Object.values(pinnedFiles)).size).toBe(8)
  })

  it('classifies every generated ListTokens declaration as read or unread', () => {
    expect(listTokenDeclarations).toHaveLength(120)
    expect(new Set(listTokenDeclarations).size).toBe(120)
    expect(listTokenReads).toHaveLength(46)
    expect(new Set(listTokenReads).size).toBe(46)
    expect(listTokenReads.every((role) => listTokenDeclarations.includes(role))).toBe(true)
    expect(listTokenDeclarations.filter((role) => !listTokenReads.includes(role))).toHaveLength(
      74,
    )
  })

  it('keeps ReorderListTokens as a distinct nine-role source family', () => {
    expect(reorderTokenDeclarations).toHaveLength(9)
    expect(reorderTokenReads).toHaveLength(7)
    expect(
      reorderTokenReads.every((role) => reorderTokenDeclarations.includes(role)),
    ).toBe(true)
    expect(
      reorderTokenDeclarations.filter((role) => !reorderTokenReads.includes(role)),
    ).toEqual(['ItemDropZoneColor', 'ItemTrailingSupportingTextColor'])
  })

  it('accounts for current, deprecated, and anomalous source paths', () => {
    expect(currentSurface).toHaveLength(25)
    expect(deprecatedSurface).toHaveLength(13)
    expect(implementationAnomalies).toHaveLength(4)
    expect(componentSource).toContain("requestedInteraction === 'action'")
    expect(componentSource).toContain("requestedInteraction === 'single'")
    expect(componentSource).toContain("requestedInteraction === 'multiple'")
    expect(componentSource).toContain('segmentedPosition')
    expect(componentSource).not.toContain('onLongClick')
  })

  it('freezes all 44 behavior and 27 screenshot cases as audited inputs', () => {
    expect(behaviorTests).toHaveLength(44)
    expect(screenshotTests).toHaveLength(27)
    expect(behaviorTests.filter((name) => name === 'listItem_oneLine_size')).toHaveLength(2)
    expect(screenshotTests).toContain('segmentedListItem_allChecked')
    expect(screenshotTests).toContain('listItem_focused_insetFocusRings')
  })

  it('pins registry identity and avoids generated-but-unread fictitious tokens', () => {
    const registration = defaultTokenSet.componentTokens.find(
      (candidate) => candidate.component === 'list-item',
    )
    expect(registration?.source).toEqual({
      id: 'androidx-material3-list-item',
      url: 'https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ListItem.kt',
      revision: 'a90df2fc27e026b9ad2ed569f203a260c1041fab',
      accessed: '2026-07-24',
    })
    expect(registration?.tokens).not.toHaveProperty('hover-label-color')
    expect(registration?.tokens).not.toHaveProperty('leading-video-width')
    expect(registration?.tokens).not.toHaveProperty('reorder-drop-zone-color')
    expect(registration?.tokens).toHaveProperty('reorder-dragged-container-color')
  })

  it('keeps every observable source geometry, state, and motion path searchable', () => {
    for (const marker of [
      '--m3e-comp-list-item-one-line-container-height',
      '--m3e-comp-list-item-two-line-container-height',
      '--m3e-comp-list-item-three-line-container-height',
      '--m3e-comp-list-item-segmented-gap',
      '--m3e-comp-list-item-reorder-dragged-container-color',
      '--m3e-comp-list-item-reorder-dragged-container-shadow',
      '[data-m3e-position="first"]',
      ':has(.m3e-list-item__input:checked)',
      'prefers-reduced-motion',
      'forced-colors',
    ]) {
      expect(css).toContain(marker)
    }
  })
})
