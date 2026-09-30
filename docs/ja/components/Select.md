# Select

`Select`はデータ駆動型のcomboboxです。`TextField`と同じ装飾を持つ読み取り専用のトリガーフィールドと、`Menu`と同じ装飾を持つポップアップリストボックスで構成します。ネイティブの`<select>`要素は使いません。ライブラリが対応するブラウザー範囲では、ネイティブ`<select>`のポップアップ内にMaterial独自の選択肢行を一貫してスタイル設定できないためです。

```tsx
import { Select } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<Select
  label="Favorite fruit"
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]}
  value={value}
  onValueChange={setValue}
/>
```

## 仕様 {#contract}

- `value`／`defaultValue`／`onValueChange`（いずれも`string`）は、ほかの状態を持つコンポーネントと同じ制御／非制御の形式です。
- `options: readonly SelectOption[]`は`{ value, label: string, disabled? }`の形式です。`label`はプレーンな文字列です。トリガー上に選択値として表示するためで、ネイティブ`<select>`の`<option>`もテキストであるのと同様です。
- `label`、`variant`（既定値`"filled"`、または`"outlined"`）、`leadingIcon`、`supportingText`、`error`、`disabled`は、`TextField`と同じprop名と既定値です。
- `open`／`defaultOpen`／`onOpenChange`でポップアップリストボックスを制御できます。直接監視または操作したい場合に使います。
- refはトリガーとなる入力を参照します。`className`と`style`はフィールドのルートに適用されます。

トリガーは読み取り専用入力ですが、`TextField`と同じ個別の論理方向の先頭／コンテンツ／末尾領域を持ちます。任意の先頭アイコンと必須の末尾シェブロンは入力領域の外にそれぞれの幅を確保します。利用側のCSSで入力余白をリセットしても、表示値とブラウザー標準の入力領域がアイコンに重なりません。上／コンテンツ／下のグリッド行も共通で、filled／outlinedのラベルと値の位置はネイティブ入力のブロック余白に依存しません。

## キーボード操作 {#keyboard}

閉じているときにEnter、Space、ArrowDown、ArrowUpを押すとリストボックスを開き、現在の選択肢（選択がなければ有効な最初または最後の選択肢）をアクティブにします。開いているときはArrowDown／ArrowUp／Home／Endでアクティブな選択肢を移動し、文字入力で先頭一致に移動します。Enter／Spaceで確定して閉じます。Escapeは値を変更せずに閉じ、Tabでも閉じます。

`Menu`とは異なり、フォーカスはトリガーから移動しません。現在ハイライトされている選択肢は`aria-activedescendant`で追跡します。これは、`Menu`のように各項目へ実際のフォーカスを移すのではなく、WAI-ARIA APGのselect-only comboboxパターンに従っています。

## フォーム {#forms}

```tsx
<Select label="Favorite fruit" name="favorite-fruit" options={options} defaultValue="apple" />
```

`name`を指定すると、現在の値を持つ補助的な`<input type="hidden">`が出力されます。表示コントロールは値を送信しない読み取り専用入力ですが、これにより`Select`はネイティブのフォーム送信、`FormData`、`form.reset()`に参加できます。

## トークンと境界 {#tokens-and-boundaries}

`Select`独自のコンポーネントトークンは登録しません。フィールド装飾は`TextField`の`--m3e-comp-text-field-*`登録を、ポップアップのリストボックスは`Menu`の`--m3e-comp-menu-*`登録をそのまま再利用します。どちらのテーマ上書きも`Material3Provider`のスコープ内で適用されます。`Select`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
