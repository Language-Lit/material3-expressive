import { ImageResponse } from 'next/og'
import { getConformantComponents } from '../content/inventory'
import { socialImage } from '../content/site'

/**
 * The social and link-preview card, generated at build time from the same
 * inventory the pages read — so the component count on the card cannot fall
 * behind the count on the page.
 *
 * Drawn from the default theme's key colors rather than from the live palette:
 * the card is baked once at build time and has no source color to follow.
 */
export const dynamic = 'force-static'

export const alt = socialImage.alt
export const size = { width: socialImage.width, height: socialImage.height }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  const components = await getConformantComponents()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#1d1b20',
          color: '#e6e0e9',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* The shape vocabulary the site uses as its imagery, at card scale. */}
          <div style={{ width: 72, height: 72, borderRadius: 36, background: '#d0bcff' }} />
          <div style={{ width: 72, height: 72, borderRadius: 24, background: '#ccc2dc' }} />
          <div style={{ width: 72, height: 72, borderRadius: 8, background: '#efb8c8' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 30, color: '#cac4d0', marginBottom: 16 }}>
            Independent implementation · React 18 &amp; 19
          </div>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Google’s Material 3 Expressive.
          </div>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Built for React.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 21 }}>
          <div style={{ color: '#d0bcff' }}>@language-lit/material3-expressive</div>
          {/*
           * One child node, not two. Satori requires an explicit `display` on
           * any element with more than one child, and `{n} components` is two
           * children — a number and a string — not one interpolated sentence.
           */}
          <div style={{ color: '#cac4d0' }}>
            {`${components.length} components · MIT licensed`}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
