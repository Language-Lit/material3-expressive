# ADR 0032: Native-semantic List Item family with a pinned source ledger

Status: accepted
Date: 2026-07-24
Task: T40

## Context

AndroidX revision `a90df2fc27e026b9ad2ed569f203a260c1041fab`
contains four current `ListItem` interaction overloads and four matching
`SegmentedListItem` overloads: passive, click, single selection, and multiple
selection. It also retains one deprecated headline-first overload, a defaults
object, three public value classes, 120 generated `ListTokens` declarations,
nine generated `ReorderListTokens` declarations, 44 behavior tests, and 27
screenshot tests.

The source's `Modifier`, composable slots, `InteractionSource`, shape/color/
elevation value objects, measure policies, and semantics DSL do not map
directly to React. Observable details still have to survive:

- native interaction and selection semantics;
- 56/72/88px line geometry, 16px logical edge padding, 10px block padding,
  12px precision-pointer block padding and 12px internal spacing;
- segmented 2px gaps and outer-only large corners;
- center alignment for shorter items and top alignment for tall items;
- base, selected, disabled, dragged, hover, focus, and press resolution;
- pressed → dragged → selected → focused → hovered shape precedence;
- Level 4 dragged elevation;
- five content color channels and four sourced typography roles;
- generated declarations which exist but are not read by the implementation.

## Decision

1. Expose `ListItem` and `SegmentedListItem` as one family. Both use an
   `interaction` discriminant: `none`, `action`, `single`, or `multiple`.
   `SegmentedListItem` additionally requires zero-based `index` and positive
   `count`.

2. Let native elements own behavior. Passive items render `div` or `li`,
   actions render `button`, single selection renders `input type="radio"`,
   and multiple selection renders `input type="checkbox"`. Selection inputs
   cover their wrapping label, so the entire visual row activates the native
   control. The forwarded ref targets that semantic element.

3. Keep state controlled by the native input whenever uncontrolled. This
   preserves radio grouping, form serialization, reset, disabled behavior,
   keyboard activation, click cancellation, and `:checked` truth even when a
   sibling radio changes without dispatching an event on the deselected item.
   Controlled state requires its corresponding callback.

4. Preserve the source anatomy as explicit headline, leading, trailing,
   overline, and supporting slots. Slots are part of one semantic row and must
   not contain nested controls when the row is interactive.

5. Translate segmented position into logical corners. Invalid runtime
   `index`/`count` values warn and fall back to the safe only-item shape.
   TypeScript makes both values required but cannot prove numeric ranges.

6. Resolve visuals in CSS. Checked inputs select the secondary-container
   treatment; native drag events expose the separate reorder dragged treatment.
   Disabled colors override selected and dragged colors, while disabled
   selected shape remains selected. Cascade order preserves source shape
   priority exactly. Effects motion animates colors/state layers and
   fast-spatial motion animates shape/elevation.

7. Keep `ReorderListTokens` ownership visible in names. Dragged colors and
   shape use `reorder-dragged-*`; dragged elevation retains its actual
   `ListTokens` source. Only literal generated reads are registered. Web target
   and focus-ring values and direct implementation padding are documented
   separately.

8. Exclude pointer-only long press from the public API. The web has no native
   keyboard-equivalent long-click activation, and exposing it would create an
   inaccessible action. Compose arbitrary token objects and layout plumbing
   are also excluded; scoped provider tokens and CSS reproduce their rendered
   defaults.

9. Freeze the audit inputs. The executable source ledger records eight file
   blob identities, the complete 120/9 generated declarations and read/unread
   partitions, current and deprecated API paths, four implementation details,
   and every upstream behavior and screenshot name.

## Consequences

- The package gains two named components within one inventory family and no
  package export path, runtime dependency, or peer dependency.
- Consumers get native browser behavior rather than a simulated row role.
- Interactive slot content is intentionally single-action. Multi-action rows
  use a passive item containing independently named controls.
- Arbitrary Compose per-instance shape/color/elevation objects are replaced by
  stable provider-scoped component tokens.
- Upstream changes fail a finite ledger instead of silently drifting token or
  interaction behavior.
