# FloatingToolbar

`FloatingToolbar`はツールバー項目（通常は`IconButton`）を浮かぶピル型コンテナにまとめます。WAI-ARIA APGのtoolbarパターンに沿ったロービングtabindexのキーボード操作に対応します。

```tsx
import { FloatingToolbar, IconButton } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<FloatingToolbar aria-label="Formatting">
  <IconButton aria-label="Bold"><BoldIcon /></IconButton>
  <IconButton aria-label="Italic"><ItalicIcon /></IconButton>
  <IconButton aria-label="Underline"><UnderlineIcon /></IconButton>
</FloatingToolbar>
```

## 契約 {#contract}

- `children`は直接描画され、通常は`IconButton`を渡します。既定の`orientation="horizontal"`では左右の矢印キー、`orientation="vertical"`では上下の矢印キーで項目間を折り返しながら移動できます。`Home`／`End`で先頭／末尾に移動します。現在の項目のみがページのTab順に含まれて`tabindex="0"`となり、ほかの項目は`tabindex="-1"`になります。
- `variant`（`'standard' | 'vibrant'`、既定値`'standard'`）でコンテナとコンテンツの色の組み合わせを選びます。
- `expanded`／`defaultExpanded`／`onExpandedChange`でコンテナ全体の表示／折りたたみを制御します。スクロールに応じて表示を切り替えるには、利用側のスクロールリスナーと接続します。`FloatingToolbar`自体はスクロールを管理しません。
- `role="toolbar"`と`aria-orientation`を設定します。必須のアクセシブルな名前は`aria-label`または`aria-labelledby`で指定します。
- ビューポートに対する配置（独自の`position: fixed`や`sticky`）は行いません。レイアウトに合わせて`className`または`style`を指定してください。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーション時間はすべて、`Material3Provider`でスコープされる`--m3e-comp-floating-toolbar-*` CSSカスタムプロパティから取得します。`FloatingToolbar`は実行時スタイルを挿入せず、`requestAnimationFrame`ループも使いません。
