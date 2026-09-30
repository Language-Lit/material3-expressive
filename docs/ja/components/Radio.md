# Radio

`Radio`は、Materialのアイコン、ステートレイヤー、モーションを備えたネイティブの`input type="radio"`です。ラベルやグループ用のラッパーは持たないため、通常のHTMLラベル付けやネイティブのグループ化と組み合わせられます。

```tsx
import { Radio } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<label>
  <Radio name="plan" value="pro" defaultChecked />
  Pro plan
</label>
<label>
  <Radio name="plan" value="team" />
  Team plan
</label>
```

## 仕様 {#contract}

- レンダーされるのはネイティブのラジオ入力1つです。ref、`value`、`form`、`required`、`id`、ARIA属性とdata属性、ネイティブのイベントハンドラーはこの入力に渡されます。
- `name`は必須です。同じ`name`を持つ2つ以上の`Radio`はネイティブグループになり、ブラウザーが排他的選択を適用します。ライブラリ側で調整しなくても、矢印キーでフォーカスと選択が移動します。
- `className`と`style`はRadioのルート要素に適用されます。ルート要素は、ソース由来の直径`20px`の円の周囲に`48px`の操作領域を確保します。
- `checked`と`onCheckedChange`を使うと制御されます。`defaultChecked`を使うと非制御となり、フォームのリセットや同じグループ内の別項目を選択したときの解除を含め、チェック状態をDOMに任せます。
- ライブラリが状態を更新する前に`onChange`が実行されます。`preventDefault()`を呼び出すと更新を取り消せます。
- `onCheckedChange`はブラウザーが解決した値を通知するため、別途トグル値を計算する必要はありません。

## 状態とモーション {#states-and-motion}

| 状態 | リングとドット |
| --- | --- |
| 未選択 | on-surface-variant |
| 選択済み | primary |
| 無効、未選択 | on-surface at 0.38 |
| 無効、選択済み | on-surface at 0.38 |

ホバー、フォーカス、押下時には直径`40px`の円形ステートレイヤーを使います。ドットは無効状態にかかわらずExpressive fast-spatialモーションで表示／非表示を切り替えます。リングとドットの共通色は有効時にExpressive default-effectsモーションで遷移し、無効時は直ちに切り替わります。これはソースにある有効時のみ色をアニメーションする条件に合わせています。モーションを低減すると、すべての変化が直ちに適用されます。

現行のAndroidX RadioButtonにはサイズ、バリアント、エラー用のパラメーターがありません。そのため、この実装は1種類のみを提供し、固定されたソースにないExpressiveな形状を独自に追加しません。

## アクセシビリティ {#accessibility}

ネイティブコントロールがロール、選択状態、必須状態、キーボード操作を提供します。フォーカスされた未選択ラジオではSpaceキーが選択し、共有`name`グループ内では矢印キーでフォーカスと選択が移動します。Enterキーでは選択されません。ラベルはラッパーの`label`、`label for`、`aria-label`、`aria-labelledby`で指定します。

直径`20px`の円は`48px`の操作領域に収まります。`:focus-visible`ではトークンに基づくフォーカスリングを円に描画します。強制カラーではリングのアウトラインを保ち、選択済みリング／ドットとフォーカスリングにHighlight、無効状態にGrayTextを使います。レイアウトは論理方向に対応しているため、RTLでも正しく動作します。

## トークンと境界 {#tokens-and-boundaries}

Radioは検索可能な`--m3e-comp-radio-*`変数を登録します。対象は次のとおりです。

- 最小操作領域、コンテナーのサイズ、アウトライン幅、ドットのサイズ、ステートレイヤーのサイズ。
- リングとドットで共有する選択時／未選択時のアイコン色。
- 不透明度を分けた、無効かつ選択済み／未選択のアイコン色。
- 選択時／未選択時のステートレイヤー色とフォーカスリング。

テーマの上書きは`Material3Provider`のスコープ内で適用されます。Radioは実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
