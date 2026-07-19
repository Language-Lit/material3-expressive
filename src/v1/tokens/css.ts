import { assertTokenSet } from './validation'
import { tokenPathToCssVariable } from './paths'
import {
  COLOR_ROLE_NAMES,
  ELEVATION_LEVEL_NAMES,
  FONT_AXIS_TAGS,
  MOTION_CATEGORY_NAMES,
  MOTION_SCHEME_NAMES,
  MOTION_SPEED_NAMES,
  PALETTE_TOKEN_NAMES,
  SHAPE_CORNER_VALUE_NAMES,
  SHAPE_ROLE_NAMES,
  STATE_OPACITY_NAMES,
  TYPEFACE_FAMILY_TOKEN_NAMES,
  TYPEFACE_WEIGHT_TOKEN_NAMES,
  TYPOGRAPHY_EMPHASES,
  TYPOGRAPHY_ROLE_NAMES,
  type ComponentTokenDefinition,
  type FoundationTokenPath,
  type FoundationTokenSet,
  type ShadowLayer,
} from './schema'

interface CssDeclaration {
  readonly name: string
  readonly value: string
}

const genericFontFamilies = new Set([
  'cursive',
  'emoji',
  'fangsong',
  'fantasy',
  'math',
  'monospace',
  'sans-serif',
  'serif',
  'system-ui',
  'ui-monospace',
  'ui-rounded',
  'ui-sans-serif',
  'ui-serif',
])

function fontFamilyValue(families: readonly string[]): string {
  return families
    .map((family) => (genericFontFamilies.has(family) ? family : JSON.stringify(family)))
    .join(', ')
}

function referenceValue(path: FoundationTokenPath): string {
  return `var(${tokenPathToCssVariable(path)})`
}

function valueOf(definition: ComponentTokenDefinition): string {
  if (
    definition.value !== null &&
    typeof definition.value === 'object' &&
    '$ref' in definition.value
  ) {
    return referenceValue(definition.value.$ref)
  }
  return String(definition.value)
}

function shadowLayerValue(layer: ShadowLayer): string {
  const color = `color-mix(in srgb, var(--m3e-sys-color-shadow) ${layer.opacity * 100}%, transparent)`
  return `${layer.x} ${layer.y} ${layer.blur} ${layer.spread} ${color}`
}

function referenceDeclarations(tokenSet: FoundationTokenSet): CssDeclaration[] {
  const declarations: CssDeclaration[] = PALETTE_TOKEN_NAMES.map((name) => ({
    name: tokenPathToCssVariable(`ref.palette.${name}`),
    value: tokenSet.reference.palette[name],
  }))
  for (const name of TYPEFACE_FAMILY_TOKEN_NAMES) {
    declarations.push({
      name: tokenPathToCssVariable(`ref.typeface.${name}`),
      value: fontFamilyValue(tokenSet.reference.typeface[name]),
    })
  }
  for (const name of TYPEFACE_WEIGHT_TOKEN_NAMES) {
    declarations.push({
      name: tokenPathToCssVariable(`ref.typeface.weight.${name}`),
      value: String(tokenSet.reference.typeface.weight[name]),
    })
  }
  return declarations
}

function colorDeclarations(
  tokenSet: FoundationTokenSet,
  mode: 'light' | 'dark',
): CssDeclaration[] {
  return COLOR_ROLE_NAMES.map((role) => ({
    name: tokenPathToCssVariable(`sys.color.${role}`),
    value: referenceValue(tokenSet.system.color[mode][role].$ref),
  }))
}

function typographyDeclarations(tokenSet: FoundationTokenSet): CssDeclaration[] {
  const declarations: CssDeclaration[] = []
  for (const emphasis of TYPOGRAPHY_EMPHASES) {
    for (const role of TYPOGRAPHY_ROLE_NAMES) {
      const style = tokenSet.system.typography[emphasis][role]
      const prefix = `sys.typography.${emphasis}.${role}` as const
      declarations.push(
        {
          name: tokenPathToCssVariable(`${prefix}.fontFamily`),
          value: referenceValue(style.fontFamily.$ref),
        },
        {
          name: tokenPathToCssVariable(`${prefix}.fontWeight`),
          value: referenceValue(style.fontWeight.$ref),
        },
        { name: tokenPathToCssVariable(`${prefix}.fontSize`), value: style.fontSize },
        { name: tokenPathToCssVariable(`${prefix}.lineHeight`), value: style.lineHeight },
        { name: tokenPathToCssVariable(`${prefix}.letterSpacing`), value: style.letterSpacing },
      )
      for (const axis of FONT_AXIS_TAGS) {
        declarations.push({
          name: tokenPathToCssVariable(`${prefix}.axes.${axis}`),
          value: String(style.axes[axis]),
        })
      }
    }
  }
  return declarations
}

function shapeDeclarations(tokenSet: FoundationTokenSet): CssDeclaration[] {
  const declarations: CssDeclaration[] = SHAPE_CORNER_VALUE_NAMES.map((name) => ({
    name: tokenPathToCssVariable(`sys.shape.cornerValues.${name}`),
    value: tokenSet.system.shape.cornerValues[name],
  }))
  for (const name of SHAPE_ROLE_NAMES) {
    declarations.push({
      name: tokenPathToCssVariable(`sys.shape.corners.${name}`),
      value: tokenSet.system.shape.corners[name],
    })
  }
  return declarations
}

function motionDeclarations(tokenSet: FoundationTokenSet): CssDeclaration[] {
  const declarations: CssDeclaration[] = []
  for (const scheme of MOTION_SCHEME_NAMES) {
    for (const speed of MOTION_SPEED_NAMES) {
      for (const category of MOTION_CATEGORY_NAMES) {
        const spec = tokenSet.system.motion[scheme][speed][category]
        const prefix = `sys.motion.${scheme}.${speed}.${category}` as const
        declarations.push(
          {
            name: tokenPathToCssVariable(`${prefix}.dampingRatio`),
            value: String(spec.dampingRatio),
          },
          {
            name: tokenPathToCssVariable(`${prefix}.stiffness`),
            value: String(spec.stiffness),
          },
        )
      }
    }
  }
  return declarations
}

function elevationDeclarations(tokenSet: FoundationTokenSet): CssDeclaration[] {
  const declarations: CssDeclaration[] = []
  for (const name of ELEVATION_LEVEL_NAMES) {
    const level = tokenSet.system.elevation[name]
    declarations.push(
      { name: tokenPathToCssVariable(`sys.elevation.${name}.dp`), value: level.dp },
      {
        name: tokenPathToCssVariable(`sys.elevation.${name}.tonalOverlayOpacity`),
        value: String(level.tonalOverlayOpacity),
      },
      {
        name: tokenPathToCssVariable(`sys.elevation.${name}.shadow`),
        value: `${shadowLayerValue(level.shadow.key)}, ${shadowLayerValue(level.shadow.ambient)}`,
      },
    )
  }
  return declarations
}

function remainingSystemDeclarations(tokenSet: FoundationTokenSet): CssDeclaration[] {
  const declarations = [
    ...typographyDeclarations(tokenSet),
    ...shapeDeclarations(tokenSet),
    ...motionDeclarations(tokenSet),
    ...elevationDeclarations(tokenSet),
  ]
  for (const name of STATE_OPACITY_NAMES) {
    declarations.push({
      name: tokenPathToCssVariable(`sys.state.${name}`),
      value: String(tokenSet.system.state[name]),
    })
  }
  declarations.push(
    {
      name: tokenPathToCssVariable('sys.density.scale'),
      value: String(tokenSet.system.density.scale),
    },
    {
      name: tokenPathToCssVariable('sys.density.minimumInteractiveTarget'),
      value: tokenSet.system.density.minimumInteractiveTarget,
    },
  )
  return declarations
}

function componentDeclarations(tokenSet: FoundationTokenSet): CssDeclaration[] {
  return tokenSet.componentTokens.flatMap((registration) =>
    Object.entries(registration.tokens).map(([name, definition]) => ({
      name: `--m3e-comp-${registration.component}-${name}`,
      value: valueOf(definition),
    })),
  )
}

function renderRule(selector: string, declarations: readonly CssDeclaration[], indent = '  '): string {
  const body = [...declarations]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(({ name, value }) => `${indent}  ${name}: ${value};`)
    .join('\n')
  return `${indent}${selector} {\n${body}\n${indent}}`
}

export function generateTokenCss(value: unknown): string {
  assertTokenSet(value)
  const tokenSet = value as FoundationTokenSet
  const rootDeclarations = [
    ...referenceDeclarations(tokenSet),
    ...remainingSystemDeclarations(tokenSet),
    ...componentDeclarations(tokenSet),
    ...colorDeclarations(tokenSet, 'light'),
  ]
  const light = colorDeclarations(tokenSet, 'light')
  const dark = colorDeclarations(tokenSet, 'dark')
  const systemDarkRule = renderRule('[data-m3e-color-mode="system"]', dark, '    ')

  return [
    '@layer m3e.tokens {',
    renderRule(':root', rootDeclarations),
    renderRule('[data-m3e-color-mode="light"], [data-m3e-color-mode="system"]', light),
    renderRule('[data-m3e-color-mode="dark"]', dark),
    '  @media (prefers-color-scheme: dark) {',
    systemDarkRule,
    '  }',
    '}',
    '',
  ].join('\n')
}
