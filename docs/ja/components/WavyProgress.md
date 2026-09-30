# WavyProgress

`WavyProgress`はMaterial 3 Expressiveの波が移動する表現を表示します。バーに沿う滑らかな二次曲線の波（`shape="linear"`、既定値）か、リングを囲む角丸の9点波紋（`shape="circular"`）を選べます。確定進捗には`value`を指定し、連続してアニメーションする不確定な波には`value`を指定しません。仕様はネイティブの`<progress>`要素と同じです。

```tsx
import { WavyProgress } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<WavyProgress aria-label="Upload progress" value={0.4} />
<WavyProgress aria-label="Progress" shape="circular" value={0.4} />
<WavyProgress aria-label="Syncing" />
```

## 仕様 {#contract}

- `shape: 'linear' | 'circular'`（既定値`'linear'`）で向きを選びます。`[0, max]`の数値である`value`を指定すると、正確な`aria-valuenow`を持つ確定進捗を表示します。進捗が`0%`または`100%`に近づくと波の振幅はほぼ平らになるまで小さくなります。`value`を省略すると不確定モードになり、`aria-valuenow`を出力せず、振幅は常に最大になります。
- `max`の既定値は`1`です。必須のアクセシブルネームには`aria-label`または`aria-labelledby`を指定します。
- `shape="linear"`の`inline-size`は既定で`100%`です。`shape="circular"`の固有サイズは`48px`です。この幅の違いは`LinearProgress`／`CircularProgress`と同じです。
- 直線の波は`10px`のコンテナーの両端に`4px`のストローク幅の半分を確保し、山と谷が欠けないようにします。円形の波はストロークに必要な余白を設けた`44px`の描画領域に、対応する円形／星形の三次ベジェ曲線を使います。固定された`24px`のviewBox中心を軸に回転します。同期したダッシュの移動により、円形の波が移動してもスイープの端点はその場に保たれます。
- 指定された振幅しきい値では、ストローク幅を保ちながら、確定進捗の形状を平坦なパスと完全な波形パスの間で変形します。SVGの拡大縮小や不透明度のクロスフェードは使いません。
- 円形の不確定モードでは、Materialの円形トラックを表示したままアクティブなスイープと一緒に回転させ、端の丸みに合わせた隙間を連続して保ちます。
- 波のない表示には`LinearProgress`／`CircularProgress`を使います。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーションのタイミングはすべて`Material3Provider`がスコープする`--m3e-comp-wavy-progress-*` CSSカスタムプロパティから取得します。`WavyProgress`は実行時スタイルを注入せず、`requestAnimationFrame`ループも使いません。波の移動、不確定状態の動き、振幅の変化はすべてCSSの`transform`／`@keyframes`／`transition`で実現します。また、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
