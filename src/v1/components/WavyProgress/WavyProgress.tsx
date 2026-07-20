import { forwardRef, type CSSProperties, type ForwardedRef, type ReactElement } from 'react'
import type { WavyProgressProps } from './WavyProgress.types'
import {
  CIRCULAR_WAVE_PATH,
  CIRCULAR_WAVE_RADIUS,
  LINEAR_WAVE_PATH_DETERMINATE,
  LINEAR_WAVE_PATH_INDETERMINATE,
} from './wavePaths'

interface WavyProgressComponent {
  (props: WavyProgressProps): ReactElement | null
  displayName?: string
}

// Both linear wave paths are pre-rendered at a fixed 2400px intrinsic width
// (see wavePaths.ts) and revealed by a smaller, percentage-sized clipping
// parent — the SVG element itself must declare this same fixed width so it
// never stretches (which would distort the wavelength).
const LINEAR_WAVE_VIEWBOX_WIDTH = 2400

const CIRCULAR_DIAMETER = 48
const CIRCULAR_STROKE_WIDTH = 4
// Center = radius + half the stroke width, so the stroked circle's outer
// edge lands exactly on the viewBox boundary (diameter = 2 * center).
const CIRCULAR_CENTER = CIRCULAR_WAVE_RADIUS + CIRCULAR_STROKE_WIDTH / 2
const CIRCULAR_CIRCUMFERENCE = 2 * Math.PI * CIRCULAR_WAVE_RADIUS
const CIRCULAR_GAP_PCT = (4 / CIRCULAR_CIRCUMFERENCE) * 100

// WavyProgressIndicatorDefaults.indicatorAmplitude: ramps the wave's
// amplitude to zero near the start and end of determinate progress.
function amplitudeFractionFor(progressFraction: number): number {
  if (progressFraction <= 0.1 || progressFraction >= 0.95) return 0
  return 1
}

function WavyProgressRender(
  { shape = 'linear', value, max = 1, className, style, ...divProps }: WavyProgressProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const determinate = value != null
  const coercedValue = determinate ? Math.min(Math.max(value as number, 0), max) : 0
  const progressFraction = max > 0 ? coercedValue / max : 0
  const amplitudeFraction = amplitudeFractionFor(progressFraction)

  const rootProps = {
    ...divProps,
    ref: forwardedRef,
    role: 'progressbar' as const,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuenow': determinate ? coercedValue : undefined,
    className: className ? `m3e-wavy-progress ${className}` : 'm3e-wavy-progress',
    style: style as CSSProperties,
    'data-m3e-shape': shape,
    'data-m3e-determinate': determinate,
  }

  if (shape === 'circular') {
    const sweepPct = progressFraction * 100
    const trackOnLenPct = Math.max(0, 100 - sweepPct - 2 * CIRCULAR_GAP_PCT)
    return (
      <div {...rootProps}>
        <svg
          className="m3e-wavy-progress__circular-svg"
          viewBox={`0 0 ${CIRCULAR_DIAMETER} ${CIRCULAR_DIAMETER}`}
          width={CIRCULAR_DIAMETER}
          height={CIRCULAR_DIAMETER}
          aria-hidden="true"
        >
          {determinate && (
            <circle
              className="m3e-wavy-progress__track"
              cx={CIRCULAR_CENTER}
              cy={CIRCULAR_CENTER}
              r={CIRCULAR_WAVE_RADIUS}
              pathLength={100}
              transform={`rotate(-90 ${CIRCULAR_CENTER} ${CIRCULAR_CENTER})`}
              style={{
                strokeDasharray: `${trackOnLenPct} ${100 - trackOnLenPct}`,
                strokeDashoffset: -(sweepPct + CIRCULAR_GAP_PCT),
              }}
            />
          )}
          <g className="m3e-wavy-progress__global-rotate">
            <g className="m3e-wavy-progress__additional-rotate">
              {determinate && (
                <circle
                  className="m3e-wavy-progress__indicator m3e-wavy-progress__sweep"
                  cx={CIRCULAR_CENTER}
                  cy={CIRCULAR_CENTER}
                  r={CIRCULAR_WAVE_RADIUS}
                  pathLength={100}
                  transform={`rotate(-90 ${CIRCULAR_CENTER} ${CIRCULAR_CENTER})`}
                  style={{
                    strokeDasharray: `${sweepPct} ${100 - sweepPct}`,
                    strokeDashoffset: 0,
                    opacity: 1 - amplitudeFraction,
                  }}
                />
              )}
              {/* The wave path's own coordinate space is centered on
                  (waveRadius, waveRadius); translating by half the stroke
                  width aligns it with this SVG's (center, center) origin —
                  no rotate correction needed, the path already starts at
                  12 o'clock (see wavePaths.ts). The translate lives on
                  this outer, unanimated <g> and the CSS-animated
                  continuous "traveling ripple" rotation lives on the
                  inner one — CSS `transform` fully replaces (does not
                  compose with) an element's own `transform` attribute, so
                  the two must be on separate nested elements to both take
                  effect. */}
              <g transform={`translate(${CIRCULAR_STROKE_WIDTH / 2} ${CIRCULAR_STROKE_WIDTH / 2})`}>
                <g className="m3e-wavy-progress__wave-rotate">
                  <path
                    className="m3e-wavy-progress__indicator m3e-wavy-progress__sweep m3e-wavy-progress__wave"
                    d={CIRCULAR_WAVE_PATH}
                    pathLength={100}
                    vectorEffect="non-scaling-stroke"
                    style={
                      determinate
                        ? {
                            strokeDasharray: `${sweepPct} ${100 - sweepPct}`,
                            strokeDashoffset: 0,
                            opacity: amplitudeFraction,
                          }
                        : undefined
                    }
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>
    )
  }

  const pct = progressFraction * 100

  const wave = (path: string) => (
    <svg
      className="m3e-wavy-progress__linear-wave-svg"
      viewBox={`0 -1 ${LINEAR_WAVE_VIEWBOX_WIDTH} 2`}
      width={LINEAR_WAVE_VIEWBOX_WIDTH}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={path} vectorEffect="non-scaling-stroke" />
    </svg>
  )

  return (
    <div {...rootProps}>
      {determinate ? (
        <>
          <div
            className="m3e-wavy-progress__track"
            style={{ insetInlineStart: `calc(${pct}% + var(--m3e-comp-wavy-progress-linear-track-gap))` }}
          />
          <div className="m3e-wavy-progress__wave-clip" style={{ inlineSize: `${pct}%` }}>
            <div
              className="m3e-wavy-progress__wave-amplitude"
              style={{ transform: `scaleY(${amplitudeFraction})` }}
            >
              {wave(LINEAR_WAVE_PATH_DETERMINATE)}
            </div>
          </div>
          <span className="m3e-wavy-progress__stop" />
        </>
      ) : (
        <>
          <div className="m3e-wavy-progress__track" />
          <div className="m3e-wavy-progress__indeterminate-bar1">
            <div className="m3e-wavy-progress__wave-clip">{wave(LINEAR_WAVE_PATH_INDETERMINATE)}</div>
          </div>
          <div className="m3e-wavy-progress__indeterminate-bar2">
            <div className="m3e-wavy-progress__wave-clip">{wave(LINEAR_WAVE_PATH_INDETERMINATE)}</div>
          </div>
        </>
      )}
    </div>
  )
}

const ForwardedWavyProgress = forwardRef<HTMLDivElement, WavyProgressProps>(WavyProgressRender)
ForwardedWavyProgress.displayName = 'WavyProgress'

export const WavyProgress = ForwardedWavyProgress as WavyProgressComponent
