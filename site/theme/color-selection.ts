import { parseHex } from './palette'

export interface HsvColor {
  h: number
  s: number
  v: number
}

export function hexToHsv(hex: string, previousHue = 0): HsvColor {
  const rgb = parseHex(hex) ?? { r: 0, g: 0, b: 0 }
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  // Gray and black have no hue; retain the user's hue while editing them.
  let h = previousHue
  if (delta > 0) {
    const sector = max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
    h = ((sector * 60) + 360) % 360
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max }
}

export function hsvToHex({ h, s, v }: HsvColor): string {
  const channel = (offset: number) => {
    const k = (offset + h / 60) % 6
    const value = v * (1 - s * Math.max(0, Math.min(k, 4 - k, 1)))
    return Math.round(value * 255).toString(16).padStart(2, '0')
  }
  return `#${channel(5)}${channel(3)}${channel(1)}`
}
