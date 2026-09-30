# Checkbox

`Checkbox`は`input type="checkbox"`を使い、現行Materialのコンテナー、アウトライン、チェックマーク、ステートレイヤー、モーションを備えます。ラベルは内包しないため、通常のHTMLラベルと組み合わせられます。

```tsx
import { Checkbox } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<label>
  <Checkbox name="preferences" value="marketing" defaultChecked />
  Send me product updates
</label>
```

## 仕様 {#contract}

- 描画されるコントロールはネイティブのチェックボックス入力1つです。ref、`name`、`value`、`form`、`required`、`id`、ARIA属性、data属性、ネイティブのイベントハンドラーはこの入力要素に転送されます。
- `className`と`style`はチェックボックスのルート要素に適用されます。ルート要素は、仕様に基づく18pxのボックスを囲む48pxの操作対象を持ちます。
- `checked`と`onCheckedChange`を使うと制御状態になります。`defaultChecked`の場合はDOMが状態を管理し、ネイティブのフォームリセットにも対応します。
- `onChange`をライブラリが状態を更新する前に呼び出します。`preventDefault()`を呼ぶと更新を取り消します。
- `onCheckedChange`にはブラウザーが確定した値を通知するため、別途トグル計算を行う必要はありません。

## 混合状態 {#mixed-state}

`indeterminate`を指定すると仕様に基づくダッシュを表示し、ネイティブの`indeterminate`プロパティを設定して、`aria-checked="mixed"`を公開します。これは制御された表示状態です。操作すると実際のチェック値に遷移するため、利用側のハンドラーでpropを解除します。

```tsx
const allChecked = items.every((item) => item.selected)
const someChecked = items.some((item) => item.selected)

<Checkbox
  aria-label="Select all"
  checked={allChecked}
  indeterminate={!allChecked && someChecked}
  onCheckedChange={selectAll}
/>
```

このプロパティはシリアライズできないため、サーバーのマークアップには`aria-checked`とstate属性を含め、プロパティはハイドレーション後に設定します。ブラウザーは操作時に値を消去するので、各コミット後にも再設定します。

## 状態とモーション {#states-and-motion}

| 状態 | コンテナー | アウトライン | チェックマーク |
| --- | --- | --- | --- |
| unchecked | 透明 | on-surface-variant | なし |
| checked | primary | primary | on-primary |
| indeterminate | primary | primary | on-primaryのダッシュ |
| disabled unchecked | on-surface、不透明度0.38 | on-surface、不透明度0.38 | なし |
| disabled checked | on-surface、不透明度0.38 | on-surface、不透明度0.38 | surface |
| disabled indeterminate | on-surface、不透明度0.38 | on-surface、不透明度0.38 | surface |

hover、フォーカス、押下には直径40pxの円形ステートレイヤーを使います。チェックマークはExpressive default-spatialモーションで線に沿って表示し、描画済み状態から離れる際は線を消すのではなく、仕様の100ms遅延後に切り替わります。checkedとindeterminate間では、ファーストパーティ実装が中央線へ寄せる3点ポリラインを補間します。モーションを減らす設定では、すべての変化を即時に適用します。

現行AndroidXのCheckboxにはサイズ、バリアント、エラーのパラメーターがなく、シェイプの変化もありません。そのため、この実装では1種類の形式のみを提供し、固定されたソースにないExpressive形状は追加しません。

## アクセシビリティ {#accessibility}

ロール、チェック状態、必須状態、キーボード操作はネイティブコントロールが提供します。Spaceで操作でき、Enterでは操作しません。名前は、Checkboxを囲む`label`、`label for`、`aria-label`、`aria-labelledby`で指定します。

18pxのボックスを48pxの操作対象の内側に配置します。`:focus-visible`ではボックスにトークンに基づくフォーカスリングを描画します。強制カラー表示ではアウトラインを維持し、チェック済みのコンテナーとフォーカスリングにHighlight、無効状態にGrayTextを使います。レイアウトには論理方向を使い、RTLでも適切に表示します。

## トークンと境界 {#tokens-and-boundaries}

Checkboxは検索可能な`--m3e-comp-checkbox-*`変数を次の用途に登録します。

- 最小操作対象、コンテナーサイズとシェイプ、アウトライン幅、ステートレイヤーのサイズ、チェックマークの線幅とパス長、切り替え遅延。
- チェックマークの通常色と無効状態の色。
- checked状態と無効状態のコンテナー色およびそれぞれの不透明度。
- checked、unchecked、3種類の無効状態におけるアウトライン色。
- checkedとuncheckedのステートレイヤー色およびフォーカスリング。

テーマの上書きは`Material3Provider`内に限定されます。Checkboxは実行時スタイルを挿入しません。Next.js、Vite、ルーター、アニメーションライブラリ、アプリケーション独自のコードは読み込みません。
