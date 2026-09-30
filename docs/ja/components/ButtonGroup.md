# ButtonGroup

`ButtonGroup`は`Button`、`IconButton`などのインタラクティブな子要素を横一列に並べます。子要素を押すと、その要素が視覚的に大きくなり、隣接する要素が縮小します。これはMaterial 3 Expressiveの「押下をきっかけとした隣接要素の圧縮」インタラクションです。

```tsx
import { Button, ButtonGroup } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<ButtonGroup aria-label="Text formatting">
  <Button variant="tonal">Bold</Button>
  <Button variant="tonal">Italic</Button>
  <Button variant="tonal">Underline</Button>
</ButtonGroup>
```

## 仕様 {#contract}

- `children`は指定どおりflex行に直接描画され、仕様に沿った`BetweenSpace`の間隔が適用されます。データ配列で項目を指定するAPIはありません。通常使う`Button`や`IconButton`などのインタラクティブ要素を渡してください。
- 既定の`role`は`"group"`です。`"toolbar"`などを明示して上書きできます。`aria-label`または`aria-labelledby`でグループ全体に名前を付けます。子要素はそれぞれのアクセシブルな名前とネイティブのTab順を保ちます。
- 対応するのは標準の行レイアウトです。連結された単一選択または複数選択のボタン行には、代わりに`SegmentedButtonGroup`を使います。
- 項目が収まらないときに自動でドロップダウンメニューへ切り替える機能はありません。必要に応じて`flex-wrap`や独自のレスポンシブ処理を使ってください。

## トークンと境界 {#tokens-and-boundaries}

間隔と押下時の圧縮率はすべて、`Material3Provider`でスコープされる`--m3e-comp-button-group-*` CSSカスタムプロパティから取得します。`ButtonGroup`は実行時スタイルを挿入せず、`requestAnimationFrame`ループも使いません。圧縮動作はCSSの`transform: scale()`で実現します。`:has()`を通じて各子要素自身のネイティブな`:active`状態を参照し、JavaScriptによるレイアウト計測は行いません。
