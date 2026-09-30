# Text

`Text`は、明示的に選択したネイティブHTML要素にMaterial 3のタイプスケールを適用します。見た目のタイポグラフィと文書上の意味は独立しています。

```tsx
import { Text } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<Text as="h1" variant="displayLarge" emphasis="emphasized">
  Account
</Text>
<Text as="p" variant="bodyLarge">
  The heading level comes from `as`; the visual scale comes from `variant`.
</Text>
```

## 仕様 {#contract}

- `as`の既定値は`span`です。`span`、`p`、`div`、`h1`〜`h6`、`label`、`legend`、`strong`、`em`、`small`、`blockquote`、`figcaption`を指定できます。
- `variant`の既定値は`bodyLarge`です。Materialのdisplay、headline、title、body、labelの各サイズで`Large`、`Medium`、`Small`を指定できます。
- `emphasis`の既定値は`baseline`です。`emphasized`を指定すると、同じロールに対応する現在のMaterial 3 Expressiveのスタイルになります。
- ネイティブ属性、ARIA／data属性、スタイル、クラス、イベントハンドラー、子要素、選択した要素に適したrefを渡します。
- Textは選択した要素にユーザーエージェントの余白があれば取り除き、同じ視覚ロールで安定したレイアウトを実現します。ネイティブの表示形式は変更しません。

`variant="displayLarge"`を指定しても見出しにはなりません。ページの文書構造に合わせて`as="h1"`〜`as="h6"`を選んでください。反対に、実際の見出しに小さな視覚ロールを適用しても、見出しレベルは維持されます。

## Expressiveタイプスケール {#expressive-type-scale}

15種類のロールは次のとおりです。

- `displayLarge`、`displayMedium`、`displaySmall`
- `headlineLarge`、`headlineMedium`、`headlineSmall`
- `titleLarge`、`titleMedium`、`titleSmall`
- `bodyLarge`、`bodyMedium`、`bodySmall`
- `labelLarge`、`labelMedium`、`labelSmall`

各ロールにはベースラインと強調スタイルがあります。強調スケールは単純な太字切り替えではなく、個別にテーマ設定できるMaterialのスケールです。テーマでは、ベースライン側を変えずにフォントファミリー、太さ、サイズ、行の高さ、字間、可変フォント軸を変更できます。

## タイポグラフィトークンとフォント {#typography-tokens-and-fonts}

Textは`--m3e-sys-typescale-{emphasis}-{kebab-role}-*`変数から、選択したロールのフォントファミリー、太さ、サイズ、行の高さ、字間、および`CRSV`、`FILL`、`GRAD`、`HEXP`、`ROND`、`opsz`、`slnt`、`wdth`、`wght`の各軸を直接取得します。Textコンポーネント用のトークンはありません。標準のTextはシステムのタイプスケールと継承されたコンテンツ色を直接使用します。

Textのレンダー時にフォントをダウンロードしたり注入したりすることはありません。アプリケーション側でフォントファイルと`@font-face`を用意し、`theme.reference.typeface.brand`と`.plain`を設定します。フォントが対応していない可変軸は無視されます。設定した軸をすべて適用するには、十分な軸に対応した可変フォントを使ってください。

Textは周囲から`color`を継承します。`Surface`はMaterialに合うコンテンツ色を指定します。意図的に例外を設ける場合は、利用側の通常のCSSで色などの表示を上書きできます。

## アクセシビリティと適応 {#accessibility-and-adaptation}

Textはロール、フォーカス対象、キーボード動作、アクセシブルな状態、操作を追加しません。ネイティブの見出し、ラベル、凡例、テキストレベルの意味付けが優先されます。`label`は有効なフォームコントロールとの関連付けがある場合のみ使い、見た目のロールにかかわらず見出しレベルを文書構造に沿って保ってください。

コンポーネント独自のモーション、物理方向のレイアウト、ブレークポイント、強制カラー上書きはありません。ブラウザーの文字拡大、書字方向、強制カラー、利用側のレスポンシブCSSはそのまま適用されます。自動フィットや文字の省略はExpressiveのタイプロールではなくレイアウト上の方針のため、この基盤APIの対象外です。
