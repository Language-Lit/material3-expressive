# LinearProgress

`LinearProgress`は横長の直線的な進捗バーを表示します。確定した進捗には`value`を指定し、連続してアニメーションする不確定な進捗バーには`value`を指定しません。これはネイティブの`<progress>`要素と同じ仕様です。

```tsx
import { LinearProgress } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<LinearProgress aria-label="Download progress" value={0.4} />
<LinearProgress aria-label="Loading" />
```

## 仕様 {#contract}

- `[0, max]`の数値である`value`を指定すると、正確な`aria-valuenow`を持つ確定進捗を表示します。`value`を省略すると不確定モードになり、2本のバーが連続してアニメーションします。この場合、支援技術に処理中または不確定な状態を伝えるため、`aria-valuenow`は出力しません。
- `max`の既定値は`1`です。`aria-label`または`aria-labelledby`で必須のアクセシブルネームを指定します。`LinearProgress`自体に表示ラベルはありません。
- `inline-size`の既定値は`100%`で、ネイティブの`<progress>`要素と同様に幅いっぱいに表示します。ルート要素またはラッパーに通常のCSSを指定して変更できます。
- Material 3 Expressiveの波が移動する表現には`WavyProgress`を使います。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーションのタイミングはすべて`Material3Provider`がスコープする`--m3e-comp-linear-progress-*` CSSカスタムプロパティから取得します。`LinearProgress`は実行時スタイルを注入せず、`requestAnimationFrame`ループも使いません。不確定状態の動きはCSSの`@keyframes`だけで実現します。また、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
