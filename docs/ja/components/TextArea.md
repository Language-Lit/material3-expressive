# TextArea

`TextArea`は、`TextField`と同じラベル、インジケーター／アウトライン、アイコンスロット、補足／エラーテキストの装飾を使うネイティブの`textarea`です。固定されたソースには専用の複数行コンポーザブルはなく、`singleLine=false`の`TextField`／`OutlinedTextField`で単一行と複数行を同じ装飾レイヤーで扱います。Webでも別のコンポーネントツリーを重複させず、この構成に合わせています。

```tsx
import { TextArea } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<TextArea
  label="Feedback"
  rows={4}
  value={feedback}
  onChange={(event) => setFeedback(event.currentTarget.value)}
  supportingText="Tell us what worked and what didn't"
/>
```

## 仕様 {#contract}

ネイティブの`input`の代わりに`textarea`を使う点を除き、`TextField`の仕様と同じです（`TextField.md`を参照）。ネイティブの`textarea`に`type`属性はないため、`type` propもありません。`rows`、`cols`、`wrap`、`maxLength`など、ほかのネイティブ属性はすべてそのまま渡されます。Webで利用しやすいよう、ネイティブの縦方向リサイズ（`resize: vertical`）を維持します。`rows`はネイティブのコンテンツ行の高さを決めます。共通のフィールドグリッドがMaterialの上下領域を加え、コンテナー全体の最低高を56pxに保ちます。自動拡張する高さは対象外です。

## 複数行のレイアウト {#multiline-layout}

空のラベルは、すべての行の中央ではなく、通常の上側余白16pxから配置します。先頭／末尾のアイコンスロットはコンテナー全体の縦中央に置きます。これは固定された測定ポリシーにある複数行ラベル分岐と、共通のアイコン配置に従ったものです。インライン方向では、ネイティブのtextareaが`TextField`と同じ中央領域を使います。通常の端には16px、アイコン側の端には52pxを確保するため、ネイティブtextareaの余白をリセットしてもカーソルがアイコンの下に入りません。

ブロック方向も同じグリッドで管理します。filledでは24pxのラベル領域の後から入力内容が始まり、下に8pxを残します。outlinedでは上下に16pxずつ確保します。そのため、後から適用される`textarea { padding: 0 }`リセットが最初の入力行やラベルとの関係を変えることはありません。`rows`やネイティブの縦リサイズで増えるのは中央のコンテンツ行で、端の領域は変わりません。

## バリアント、状態、アクセシビリティ {#variants-states-and-accessibility}

`variant="filled"`と`variant="outlined"`は`TextField`と同じ状態／色の仕様です。空、入力済み、フォーカス、無効、必須、不正、エラーの表示はネイティブtextareaと共通のフィールド装飾に従います。制御／非制御の値、フォーム送信／リセット、テキスト選択、ブラウザーのスペルチェック、キーボード編集もネイティブの動作です。

表示される`label`を指定してください。補足テキストとエラーテキストは`TextField`と同様、生成された説明関係を通じてネイティブtextareaに関連付けられます。強制カラーでもフォーカス表示を維持し、モーション低減時にもアニメーションに依存せずラベルを配置します。

## トークンと境界 {#tokens-and-boundaries}

`TextArea`は`TextField`とまったく同じ`--m3e-comp-text-field-*`登録を使います。複数行用の独立した`text-area`トークン群はありません。これは複数行専用トークンを定義していない固定ソースに合わせています。

テーマの上書きは`Material3Provider`のスコープ内で適用されます。`TextArea`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
