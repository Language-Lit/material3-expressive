/**
 * The Material 3 Expressive shape vocabulary, as SVG path data.
 *
 * Shape is the part of Material 3 Expressive with no CSS equivalent: a corner
 * radius gets you a rounded rectangle, and nothing gets you a clover or a
 * scalloped disc. The site needs imagery, the package ships no assets and no
 * dependencies, and a stock illustration would say nothing about the subject.
 * So the imagery is generated here, from the same geometry the design system
 * is built on, and filled from the live tonal palette at render time.
 *
 * These are site brand, not a component claim. The package does not implement
 * a shape library, so nothing here appears in the component catalogue.
 *
 * Every path is normalized to a `0 0 100 100` viewBox centered on (50, 50).
 */

const TAU = Math.PI * 2
const CENTER = 50
const RADIUS = 50

/**
 * Distance from a corner's start point to its Bézier control point, as a
 * fraction of the distance to the vertex. At this value a right-angle corner is
 * visually indistinguishable from a circular arc.
 */
const CIRCLE_APPROXIMATION = 0.5523

interface Point {
  readonly x: number
  readonly y: number
}

const round = (value: number): number => Math.round(value * 100) / 100
const format = (point: Point): string => `${round(point.x)} ${round(point.y)}`

function polar(radius: number, angle: number): Point {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  }
}

function lerp(from: Point, to: Point, amount: number): Point {
  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
  }
}

function distance(from: Point, to: Point): number {
  return Math.hypot(to.x - from.x, to.y - from.y)
}

/** A point `length` away from `origin`, in the direction of `toward`. */
function along(origin: Point, toward: Point, length: number): Point {
  const span = distance(origin, toward)
  if (span === 0) return origin
  return lerp(origin, toward, length / span)
}

/**
 * Rounds every corner of an arbitrary polygon.
 *
 * Each corner consumes at most half of its shorter adjacent edge, so two
 * corners sharing an edge can never overlap however hard the shape is rounded.
 * That bound is what lets the same routine round a square and a twelve-pointed
 * star without special-casing either.
 */
function roundedPolygon(vertices: readonly Point[], smoothing: number): string {
  const count = vertices.length
  const entries: Point[] = []
  const exits: Point[] = []

  for (let index = 0; index < count; index += 1) {
    const vertex = vertices[index]
    const previous = vertices[(index - 1 + count) % count]
    const next = vertices[(index + 1) % count]
    const reach =
      (smoothing * Math.min(distance(vertex, previous), distance(vertex, next))) / 2

    entries.push(along(vertex, previous, reach))
    exits.push(along(vertex, next, reach))
  }

  const parts = [`M ${format(entries[0])}`]

  for (let index = 0; index < count; index += 1) {
    const vertex = vertices[index]
    const control1 = lerp(entries[index], vertex, CIRCLE_APPROXIMATION)
    const control2 = lerp(exits[index], vertex, CIRCLE_APPROXIMATION)
    parts.push(`C ${format(control1)} ${format(control2)} ${format(exits[index])}`)
    parts.push(`L ${format(entries[(index + 1) % count])}`)
  }

  parts.push('Z')
  return parts.join(' ')
}

/**
 * Stretches a vertex ring to touch all four edges of the box.
 *
 * A polygon inscribed in the unit circle only touches the box at its vertices,
 * so a triangle occupies three quarters of the height a circle does and reads
 * as undersized beside one. Material draws its polygons filling their box;
 * normalizing the vertices before the corners are rounded gets that without
 * distorting the corner arcs, because the rounding is applied afterwards.
 */
function fitVertices(vertices: readonly Point[]): Point[] {
  const xs = vertices.map((vertex) => vertex.x)
  const ys = vertices.map((vertex) => vertex.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const scaleX = 100 / (Math.max(...xs) - minX)
  const scaleY = 100 / (Math.max(...ys) - minY)

  return vertices.map((vertex) => ({
    x: (vertex.x - minX) * scaleX,
    y: (vertex.y - minY) * scaleY,
  }))
}

/** A regular polygon's vertices, first vertex pointing up, filling the box. */
function regularVertices(sides: number, rotation = -Math.PI / 4): Point[] {
  return fitVertices(
    Array.from({ length: sides }, (_unused, index) =>
      polar(RADIUS, rotation + (index * TAU) / sides),
    ),
  )
}

/** Alternating outer and inner vertices — the skeleton of a star or burst. */
function starVertices(points: number, innerRatio: number, rotation = -Math.PI / 2): Point[] {
  const step = TAU / (points * 2)
  return Array.from({ length: points * 2 }, (_unused, index) =>
    polar(index % 2 === 0 ? RADIUS : RADIUS * innerRatio, rotation + index * step),
  )
}

/**
 * A disc carrying `lobes` outward bulges — the cookie, clover, and flower
 * family. Each lobe is one circular arc between neighbouring valleys.
 *
 * The arc radius is solved rather than eyeballed. For a chord of half-length
 * `h` and a sagitta `s`, the circle through both ends and the peak has radius
 * `(h² + s²) / 2s`, so every lobe peaks exactly on the unit radius however deep
 * the valleys are cut and the shape always fills its box. When the sagitta
 * exceeds that radius the lobe is more than a semicircle and needs SVG's
 * large-arc flag — which is the difference between a clover's fat round leaf
 * and the thin spike a quadratic would draw there.
 */
function lobed(lobes: number, valleyRatio: number, rotation = -Math.PI / 2): string {
  const half = Math.PI / lobes
  const valley = RADIUS * valleyRatio
  const chord = valley * Math.sin(half)
  const sagitta = RADIUS - valley * Math.cos(half)
  const arcRadius = (chord * chord + sagitta * sagitta) / (2 * sagitta)
  const largeArc = sagitta > arcRadius ? 1 : 0
  const parts = [`M ${format(polar(valley, rotation))}`]

  for (let index = 1; index <= lobes; index += 1) {
    const to = polar(valley, rotation + index * 2 * half)
    parts.push(`A ${round(arcRadius)} ${round(arcRadius)} 0 ${largeArc} 1 ${format(to)}`)
  }

  parts.push('Z')
  return parts.join(' ')
}

/** A rectangle with independently sized corners, clockwise from top-left. */
function roundedRect(
  width: number,
  height: number,
  corners: readonly [number, number, number, number],
): string {
  const left = CENTER - width / 2
  const top = CENTER - height / 2
  const right = left + width
  const bottom = top + height
  const limit = Math.min(width, height) / 2
  const [topLeft, topRight, bottomRight, bottomLeft] = corners.map((corner) =>
    Math.min(corner, limit),
  )

  const arc = (radius: number, x: number, y: number) =>
    radius > 0 ? `A ${round(radius)} ${round(radius)} 0 0 1 ${round(x)} ${round(y)}` : ''

  return [
    `M ${round(left + topLeft)} ${round(top)}`,
    `L ${round(right - topRight)} ${round(top)}`,
    arc(topRight, right, top + topRight),
    `L ${round(right)} ${round(bottom - bottomRight)}`,
    arc(bottomRight, right - bottomRight, bottom),
    `L ${round(left + bottomLeft)} ${round(bottom)}`,
    arc(bottomLeft, left, bottom - bottomLeft),
    `L ${round(left)} ${round(top + topLeft)}`,
    arc(topLeft, left + topLeft, top),
    'Z',
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * The catalogue.
 *
 * Names follow Material's own shape names so the vocabulary is recognizable to
 * anyone who has read the specification, and the geometry is generated rather
 * than traced so a shape can be re-cut at any size without an asset pipeline.
 */
const catalogue = {
  circle: () => roundedRect(100, 100, [50, 50, 50, 50]),
  square: () => roundedRect(100, 100, [28, 28, 28, 28]),
  pill: () => roundedRect(100, 58, [29, 29, 29, 29]),
  oval: () => roundedRect(78, 100, [39, 39, 39, 39]),
  arch: () => roundedRect(100, 100, [50, 50, 14, 14]),
  fan: () => roundedRect(100, 100, [50, 14, 14, 14]),
  triangle: () => roundedPolygon(regularVertices(3, -Math.PI / 2), 0.62),
  diamond: () => roundedPolygon(regularVertices(4, -Math.PI / 2), 0.5),
  pentagon: () => roundedPolygon(regularVertices(5, -Math.PI / 2), 0.5),
  gem: () => roundedPolygon(regularVertices(6, -Math.PI / 2), 0.5),
  cookie6: () => lobed(6, 0.74),
  cookie9: () => lobed(9, 0.82),
  cookie12: () => lobed(12, 0.88),
  clover4: () => lobed(4, 0.52),
  clover8: () => lobed(8, 0.68),
  flower: () => lobed(10, 0.6),
  puffy: () => lobed(4, 0.74, -Math.PI / 4),
  sunny: () => roundedPolygon(starVertices(8, 0.8), 0.9),
  burst: () => roundedPolygon(starVertices(12, 0.72), 0.85),
} as const

export type ShapeName = keyof typeof catalogue

export const shapeNames = Object.keys(catalogue) as readonly ShapeName[]

const cache = new Map<ShapeName, string>()

/** SVG path data for a shape, in a `0 0 100 100` viewBox. */
export function shapePath(name: ShapeName): string {
  const cached = cache.get(name)
  if (cached !== undefined) return cached
  const path = catalogue[name]()
  cache.set(name, path)
  return path
}
