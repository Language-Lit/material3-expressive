# Card

`Card`はまとまりのある内容をグループ化し、現行Materialのfilled、elevated、outlinedのいずれかの表現で描画します。用途に応じて、豊富なコンテンツを含む非インタラクティブなコンテナーと、カード全体がネイティブボタンとして動作する形を、型で区別します。

```tsx
import { Button, Card } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<Card variant="filled">
  <h2>Course progress</h2>
  <p>Eight of twelve lessons complete.</p>
  <Button variant="text">Continue</Button>
</Card>
```

## 仕様 {#contract}

- `variant`は`filled`（既定値）、`elevated`、`outlined`から選択します。
- 既定は非インタラクティブモードです。`article`を描画し、文書上の意味に適した場合は`as="div"`、`section`、`aside`を指定できます。
- 非インタラクティブなCardには、アクティベーション、フォーカス、無効状態、トグル、フォーム用のpropsを指定できません。見出し、段落、リンク、ボタンなどを含む豊富な構造を配置できます。
- `interactive`を指定すると、ネイティブの`<button type="button">`を描画します。buttonのref、submit/resetのtype、フォーム所有者、name/value、無効状態、ARIA/data属性、ネイティブのイベントハンドラーを保持します。
- Cardはコンテンツの内側余白、タイポグラフィ、メディア配置、名前付きスロットを管理しません。子要素と通常のclass/style propsを使って構成します。

## カード全体をアクションにする {#whole-card-actions}

カード全体が1つのアクションを表す場合に限り、interactiveモードを使います。

```tsx
<Card interactive variant="elevated" onClick={openLesson}>
  <span>Open lesson</span>
  <small>12 minutes</small>
</Card>
```

ネイティブHTMLのボタンに含められるのはフレージングコンテンツだけです。リンク、ボタン、入力欄、フォーカス可能な子要素、またはリッチなブロック構造は入れられません。開発ビルドでは、Reactから確認できる危険な組み込み要素の子に警告します。描画後のDOMが見えないカスタムコンポーネントについては、利用側で安全性を確保してください。

見出し、段落、入れ子のアクションが必要なカードには、非インタラクティブなCardを使い、専用のコントロールを配置します。Cardは`div role="button"`、見えないオーバーレイリンク、合成キーボードハンドラーを使いません。リンクカードのナビゲーションやルーティングアダプターは、このタスクの対象外です。

## バリアントと状態 {#variants-and-state}

| バリアント | コンテナー | 通常／フォーカス／押下時 | hover時 | 枠線 |
| --- | --- | ---: | ---: | --- |
| `filled` | surface-container-highest | Level 0 | Level 1 | なし |
| `elevated` | surface-container-low | Level 1 | Level 2 | なし |
| `outlined` | surface | Level 0 | Level 1 | outline-variant、1px |

すべてのバリアントでmediumの角を使い、コンテンツにはon-surfaceを使います。outlinedのフォーカス時は枠線にon-surfaceを使います。インタラクティブなカードにはMaterialのhover、フォーカス、押下時のステートレイヤーを追加し、テーマに基づく最小48pxの操作対象を確保します。無効状態の色、枠線、エレベーションは、固定されたファーストパーティのトークンファイルに従います。非インタラクティブなカードは通常のコンテンツなので、無効状態はありません。

現行AndroidXにはExpressive Card用の別オーバーロードや、Expressiveのサイズ／シェイプ変化はありません。そのため、この実装では現行Cardの形状を維持し、テーマのExpressive default-effects投影をコンテナー、枠線、shadowの遷移に、fast-effectsをステートレイヤーに使います。モーションを減らす設定では、変化をすぐに適用します。

## アクセシビリティ {#accessibility}

非インタラクティブな要素の意味は選択したHTML要素が担います。CardはロールやTab停止位置を追加しません。インタラクティブモードでは、名前付け、ポインター、Enter、Space、フォーカス、フォーム、無効状態をネイティブボタンに任せます。`aria-pressed`、選択済み、チェック済み、ドラッグ状態は公開しません。

`:focus-visible`ではトークンに基づくsecondaryのフォーカスリングを使います。強制カラー表示ではCanvas／CanvasText、フォーカスにHighlight、無効状態にGrayTextを使います。また、半透明のステートレイヤーと作者指定のshadowをなくし、明示的な境界線を表示します。論理サイズと`text-align: start`により、RTLでもDOM順を変えずに表示できます。

## トークンと境界 {#tokens-and-boundaries}

Cardは検索可能な`--m3e-comp-card-*`変数を次の用途に登録します。

- 最小ターゲット、mediumシェイプ、フォーカスリング、無効状態のコンテンツ。
- filled／elevated／outlinedのコンテナー色とコンテンツ色。
- 通常、hover、フォーカス、押下、無効状態のshadow。
- outlinedの通常、hover、フォーカス、押下、無効状態の枠線。
- バリアント別の無効コンテナーの合成。

テーマの上書きは`Material3Provider`内に限定されます。Cardは実行時スタイルを挿入しません。Next.js、Vite、ルーター、アニメーションライブラリ、アプリケーション独自のコードは読み込みません。
