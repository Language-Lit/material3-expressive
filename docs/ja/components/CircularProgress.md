# CircularProgress

`CircularProgress`は小さく固定サイズの円形プログレスインジケーターを描画します。確定した進捗には`value`を渡し、連続して動く不確定状態のスピナーには`value`を省略します。これはネイティブの`<progress>`要素と同じ契約です。

```tsx
import { CircularProgress } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<CircularProgress aria-label="Progress" value={0.4} />
<CircularProgress aria-label="Loading" />
```

## 仕様 {#contract}

- `[0, max]`の数値を`value`に指定すると、正確な`aria-valuenow`を持つ確定進捗を描画します。`value`を省略すると不確定モードになり、アークが回転しながら脈動します。この場合は`aria-valuenow`を設定せず、支援技術に処理中または不確定の状態を伝えます。不確定モードではトラック要素を描画しません。固定されたソースでは、不確定時のトラック色が透明です。
- `max`の既定値は`1`です。`aria-label`または`aria-labelledby`で必須のアクセシブルな名前を指定します。`CircularProgress`自体には表示ラベルがありません。
- 固有サイズは40pxです。小さく固定サイズのスピナーを使う実際のWeb用途に合わせています。`--m3e-comp-circular-progress-diameter`を上書きするとサイズを変更できます。
- 確定状態のアークでは、端の丸い部分が視覚的に占める幅を考慮して、進捗部分とトラックの間隔を設けます。0%と100%では長さ0のアークを省き、SVGに点として表示されないようにします。
- 不確定時の回転レイヤーは、SVGのviewBoxの固定中心を共有します。そのため、描画領域が変わっても脈動するアークはその場で回転します。
- Material 3 Expressiveの波打つリング表現については`WavyProgress`を参照してください。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーション時間はすべて、`Material3Provider`でスコープされる`--m3e-comp-circular-progress-*` CSSカスタムプロパティから取得します。`CircularProgress`は実行時スタイルを挿入せず、`requestAnimationFrame`ループも使いません。不確定時のモーションはCSSの`@keyframes`アニメーション3つを組み合わせ、3つのアニメーション値を組み合わせるソースの動作に合わせます。Next.js、Vite、ルーター、アニメーションライブラリ、アプリケーション独自のコードは読み込みません。
