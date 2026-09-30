import type { Metadata } from 'next'
import RootLayout, { rootMetadata } from '../views/RootLayout'

/**
 * The 404 page. The static export serves it for any unknown URL in either
 * language, so it uses the English frame, which is the default locale.
 */
export const metadata: Metadata = {
  ...rootMetadata('en'),
  title: 'Page not found',
  robots: { index: false },
}

export default function GlobalNotFound() {
  return (
    <RootLayout locale="en">
      <main className="shell__main">
        <h1>404</h1>
        <p>This page could not be found.</p>
        <p lang="ja">ページが見つかりませんでした。</p>
        <p>
          <a href="/">Home</a> · <a href="/ja/" lang="ja">ホーム</a>
        </p>
      </main>
    </RootLayout>
  )
}
