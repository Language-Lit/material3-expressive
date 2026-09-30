# Surface

`Surface`は受動的なMaterialコンテナーの基盤です。セマンティックなコンテナー色とコンテンツ色の組み合わせ、シェイプによるクリッピング、色調エレベーション、影のエレベーションを適用しますが、操作動作は追加しません。

```tsx
import { Surface } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<Surface
  as="section"
  aria-labelledby="account-heading"
  color="surface-container-low"
  shape="extra-large"
  shadowElevation={1}
>
  <h2 id="account-heading">Account</h2>
  <p>Profile and security settings.</p>
</Surface>
```

## 仕様 {#contract}

- `as`の既定値は`div`です。`div`、`section`、`article`、`aside`、`main`、`header`、`footer`、`nav`のみ指定できます。意味は選択した要素が決め、Surfaceはroleを追加しません。
- `color`の既定値は`surface`です。Surfaceコンテナー系ロールは`onSurface`を使います。アクセント、エラー、固定色、反転色のロールでは、対応するMaterialコンテンツロールを選びます。
- `shape`の既定値は`none`で、現在のシステムの角丸ロールをすべて指定できます。RTLでは開始側と終了側のシェイプが入れ替わります。
- `tonalElevation`と`shadowElevation`は、それぞれ独立して`0`から`5`まで指定できます。色調エレベーションが影響するのは基本の`surface`ロールのみです。影のエレベーションは視覚効果であり、CSSの重なり順は変えません。影響を受けない色ロールに0以外の色調レベルを組み合わせると、開発ビルドで警告します。
- ネイティブ属性、ARIA／data属性、スタイル、クラス、イベントハンドラー、子要素、および選択した要素に適した型のrefを渡せます。

Surfaceは意図的に非対話型です。クリック、キーボード、無効、選択、チェックの動作には、用途に合った`Button`、`Card`、選択コンポーネントを使ってください。受動的なコンテナーにクリックハンドラーを付けても、キーボード操作には対応しません。

## カラーロール {#color-roles}

対応するロールは、surface系（`surface`、`surface-dim`、`surface-bright`、5種類の`surface-container-*`強度）、primary／secondary／tertiaryの基本・コンテナー・固定ロール、`error`、`error-container`、`inverse-surface`です。固定・減光ロールは対応する高強調度の`on*Fixed`コンテンツ色を使います。低強調度のコンテンツ色は子孫要素で独自に指定できます。

## トークン {#tokens}

既定のコンポーネント変数は次のとおりです。

- `--m3e-comp-surface-container-color`
- `--m3e-comp-surface-content-color`
- `--m3e-comp-surface-container-shape`
- `--m3e-comp-surface-container-shadow`
- `--m3e-comp-surface-tonal-overlay-opacity`

明示的なバリアントは`--m3e-sys-color-*`、`--m3e-sys-shape-corner-*`、`--m3e-sys-elevation-*`で解決されます。デザインシステム全体を統一するにはシステムテーマを上書きします。未設定のSurfaceの既定値だけを変更する場合に限り、登録済みのSurfaceコンポーネントトークンを上書きしてください。

## アクセシビリティと適応 {#accessibility-and-adaptation}

Surfaceはフォーカス対象、キーボード動作、アクセシブルな状態、対話型ロールを追加しません。ランドマーク名や文書アウトラインの正しさはページの文脈に左右されるため、利用側が管理します。モーションはなく、ブラウザーの強制カラー調整も無効化しません。

Webでは、作成したCSSで子要素をクリップし、影を表現します。Android Composeとは異なり、入れ子の実行時CompositionLocalを使って段階的に色調を重ねません。入れ子のSurfaceでは明示的なsurface-containerロールまたは色調レベルを選んでください。これによりスタイルが静的になり、SSRに対応し、スコープ化されたCSSテーマ上書きも反映できます。
