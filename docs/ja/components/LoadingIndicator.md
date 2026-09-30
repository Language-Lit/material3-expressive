# LoadingIndicator

`LoadingIndicator`はMaterial 3 Expressiveのシェイプ変形ローディングインジケーターを表示します。確定進捗には`value`を指定すると、円と柔らかな放射形の間で変形します。`value`を省略すると、7種類のシェイプを連続して変形する不確定ループになります。確定／不確定の仕様はネイティブの`<progress>`要素と同じです。

```tsx
import { LoadingIndicator } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<LoadingIndicator aria-label="Loading" value={0.4} />
<LoadingIndicator aria-label="Loading" />
```

## 仕様 {#contract}

- `[0, max]`の数値である`value`を指定すると、正確な`aria-valuenow`を持つ確定進捗を表示し、進捗に応じて円と柔らかな放射形の間で変形します。`value`を省略すると不確定モードになり、`aria-valuenow`を出力せずに7種類のシェイプを連続して変形・回転します。これにより支援技術に処理中または不確定な状態を伝えます。
- `max`の既定値は`1`です。`aria-label`または`aria-labelledby`で必須のアクセシブルネームを指定します。`LoadingIndicator`自体に表示ラベルはありません。
- 固有サイズは`48px`です。`--m3e-comp-loading-indicator-container-width`と`-container-height`を上書きするとサイズを変更できます。
- コンテナーなしの表示のみをサポートします。色付きコンテナーのバリアントはありません。

## トークンと境界 {#tokens-and-boundaries}

色とレイアウトはすべて`Material3Provider`がスコープする`--m3e-comp-loading-indicator-*` CSSカスタムプロパティから取得します。`LoadingIndicator`は実行時スタイルを注入せず、`requestAnimationFrame`ループも使いません。確定状態の動きは`value` propに基づく単純な関数で、ソースと同じポリゴン変形補間をレンダー時に同期計算します。不確定状態の動きはCSSの`@keyframes`だけで実現し、ソースのスプリングを再現する`linear()`イージングを使います。シェイプの形状データは、ソースの`RoundedPolygon`／`Morph`シェイプ照合アルゴリズムを忠実に移植して事前生成しています。手法の詳細はADR 0022を参照してください。
