# SSRとシステムカラーモード

このライブラリは決定的なサーバーマークアップをレンダリングし、`document.documentElement`を変更せずにReactハイドレーションをサポートします。カラーモードはプロバイダー自身のスコープで管理されます。

## サーバーセーフなデータエントリ {#server-safe-data-entries}

React Server Componentsやその他のサーバーモジュールから、Reactを含まないエントリを使ってテーマを作成したりトークンを調べたりできます。

```ts
import { createTheme } from '@language-lit/material3-expressive/theme'
import { defaultTokenSet } from '@language-lit/material3-expressive/tokens'

export const theme = createTheme({
  density: defaultTokenSet.system.density,
})
```

Reactコンポーネントとフックは、クライアントで利用できるモジュール内でのみルートエントリから読み込んでください。

## 決定的なシステムモード {#deterministic-system-mode}

`colorMode="system"`では、サーバーと最初のハイドレーション時のスナップショットとして`systemModeFallback`を使います。デフォルトは`light`です。静的CSSは独立して`prefers-color-scheme`を評価するため、Reactがメディアクエリーを購読する前から、ライト／ダークの表示スキームは正しくなります。

```tsx
'use client'

import type { ReactNode } from 'react'
import { Material3Provider } from '@language-lit/material3-expressive'
import type { Material3Theme } from '@language-lit/material3-expressive/theme'

export function Providers({
  children,
  theme,
}: {
  children: ReactNode
  theme: Material3Theme
}) {
  return (
    <Material3Provider
      theme={theme}
      colorMode="system"
      systemModeFallback="light"
    >
      {children}
    </Material3Provider>
  )
}
```

テーマオブジェクトはシリアライズ可能で、サーバーからクライアントへの境界を越えて渡せます。

## 任意の解決済みモード初期化 {#optional-resolved-mode-initialization}

ほとんどのアプリケーションでは静的スタイルシートだけで十分です。ハイドレーション前にアプリケーションコードから`data-m3e-resolved-color-mode`を読む場合は、プロバイダーのスコープ付き初期化スクリプトを有効にしてください。

```tsx
<Material3Provider
  colorMode="system"
  preventColorSchemeFlash
  nonce={contentSecurityPolicyNonce}
>
  {children}
</Material3Provider>
```

このスクリプトが更新するのはプロバイダー要素だけです。ポリシーで必要な場合は、リクエストのCSP nonceを渡してください。スクリプトはデフォルトでは出力されません。

## Next.js App Router {#nextjs-app-router}

ルートレイアウトから`/styles.css`を読み込み、その配下に小さなクライアントプロバイダーコンポーネントをレンダリングします。カスタムテーマデータはサーバーモジュール内で`/theme`を通じて作成し、そのサーバーモジュールからクライアント用ルートバレルを読み込まないでください。

Next.jsアダプターは公開APIに含まれていません。同じプロバイダーとシリアライズ済みテーマは、Vite、その他のSSRフレームワーク、または`renderToString`／`hydrateRoot`を直接使う構成でも動作します。

## ネストしたスコープとハイドレーション {#nested-scopes-and-hydration}

ネストした各プロバイダーは完全な`.m3e-theme`スコープを出力します。サーバーレンダリングとクライアントの最初のレンダリングでは、テーマ、`colorMode`、`systemModeFallback`に同じ値を使ってください。その後のprops変更は通常のReact状態の変更であり、ハイドレーションの手段ではありません。
