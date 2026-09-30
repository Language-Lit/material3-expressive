# SplitButton

`SplitButton`は主操作ボタンとアイコンのみの切り替えボタンを組み合わせます。切り替えボタンは通常、関連メニューを開くシェブロンなどに使います。2つのボタンは小さな内側の角丸を共有し、1つのピル形状につながって見えます。末尾のボタンは`selected`の間、完全な円形に変形します。

```tsx
import { SplitButton } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<SplitButton
  onClick={save}
  trailingIcon={<ChevronDownIcon />}
  trailingLabel="More save options"
  selected={menuOpen}
  onSelectedChange={setMenuOpen}
>
  Save
</SplitButton>
```

## 仕様 {#contract}

- `children`は先頭ボタンのラベルです。`leadingIcon`は省略できます。`onClick`は先頭ボタンでのみ呼び出されます。
- `trailingIcon`と、アイコンのみのボタンのアクセシブルネームとなる`trailingLabel`は必須です。`selected`／`defaultSelected`／`onSelectedChange`は`IconButton`と同じ制御／非制御の切り替え仕様です。実際のメニュー（たとえば、このライブラリの`Menu`）には利用側で接続してください。
- `variant`（`filled` | `tonal` | `elevated` | `outlined`、既定値`filled`）と`size`（`extra-small` | `small` | `medium` | `large` | `extra-large`、既定値`small`）は両方のボタンに適用されます。
- `disabled`を指定すると両方のボタンが無効になります。

## トークンと境界 {#tokens-and-boundaries}

色、形状、サイズごとの寸法はすべて`Material3Provider`がスコープする`--m3e-comp-split-button-*` CSSカスタムプロパティから取得します。`SplitButton`は実行時スタイルを注入せず、2つの`<button>`要素を直接レンダーします（公開コンポーネントの`Button`／`IconButton`は入れ子にしません）。
