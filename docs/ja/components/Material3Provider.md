# Material3Provider

`Material3Provider`は完全なMaterialテーマのスコープを作り、入れ子にもできます。テーマデータと解決済みのカラーモードを管理しますが、ドキュメントルートを変更したり、実行時にスタイルシートを注入したりしません。

```tsx
import {
  Material3Provider,
  useResolvedColorMode,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

function ModeLabel() {
  const mode = useResolvedColorMode()
  return <output>Resolved mode: {mode}</output>
}

export function App() {
  return (
    <Material3Provider colorMode="system">
      <ModeLabel />
    </Material3Provider>
  )
}
```

## 構造、バリアント、状態 {#anatomy-variants-and-states}

- プロバイダーは`children`を囲む`.m3e-theme`の`div`をレンダーします。標準の`div`属性、`className`、`style`、ID、data属性、ARIA属性はこのルート要素に渡されます。
- `theme`の既定値は変更不可の完全な`defaultTheme`です。カスタムテーマは公開テーマAPIで作成または解析してください。
- `colorMode`には`light`、`dark`、`system`を指定できます。既定値は`system`です。ルート要素は設定されたモードと解決済みモードを安定したdata属性で公開します。
- `systemModeFallback`はサーバーとハイドレーションで使う決定的なスナップショットで、既定値は`light`です。
- `preventColorSchemeFlash`を指定すると、スコープ付きの初期化スクリプトを出力できます。`nonce`はこのスクリプトにCSP nonceを渡します。スクリプトがなくても静的CSSがシステムのカラースキームを選びます。
- 入れ子のプロバイダーは完全に独立したスコープを開始してから、独自のテーマ差分を適用します。

## アクセシビリティ {#accessibility}

プロバイダーはウィジェットロール、フォーカス動作、キーボード操作を追加しません。ラッパーは受動的な`div`です。内部のセマンティックなランドマークは利用側で適切に指定してください。カラースキームは文書化されたロール間コントラスト要件に照らして検証されます。強制カラーとモーション低減への対応は各コンポーネントが担います。

プロバイダーのラッパーを隠す目的でroleを追加しないでください。ラッパーがレイアウトに関係する場合は、子要素の意味を変えずに通常の`className`または`style`を使います。

## トークン {#tokens}

完全なスタイルシートは既定の`--m3e-ref-*`、`--m3e-sys-*`、`--m3e-comp-*`カスタムプロパティを`.m3e-theme`に割り当てます。カスタムプロバイダーは検証済みの差分だけをインラインカスタムプロパティとして設定します。ライト／ダークのエイリアスにより、ハイドレーション前でも静的メディアクエリーでシステムモードを解決できます。

テーマ作成とトークンユーティリティは、Reactに依存しない`/theme`および`/tokens`エントリーから利用できます。[テーマ設定ガイド](../THEMING.md)と[SSRガイド](../SSR.md)も参照してください。

## SSRと境界 {#ssr-and-boundaries}

初回クライアントレンダーにも同じ`theme`、`colorMode`、`systemModeFallback`を渡すと、サーバーマークアップは決定的になります。`useResolvedColorMode`と`useMaterial3Theme`は別々のコンテキストを使うため、モードだけを使うコンポーネントはテーマ全体の変更を購読しません。

プロバイダーはフレームワークアダプターをインポートしません。Next.js、Vite、ルーター、リンク、画像、フォント、ストレージ、アプリケーション状態は利用側が管理します。
