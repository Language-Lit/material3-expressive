# Menu

`Menu`は、利用側で用意したトリガーに固定された、データ駆動型のアクションメニューをポータル表示します。ネイティブのトップレイヤープリミティブを利用できない最初のコンポーネントです。位置決め、外側クリック／Escapeによる閉じる動作、フォーカス復帰をライブラリが担います。

```tsx
import { useRef, useState } from 'react'
import { Button, Icon, Menu } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

const anchorRef = useRef<HTMLButtonElement>(null)
const [open, setOpen] = useState(false)

<Button ref={anchorRef} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(true)}>
  Actions
</Button>
<Menu
  anchorRef={anchorRef}
  open={open}
  onOpenChange={setOpen}
  items={[
    { value: 'copy', label: 'Copy', leadingIcon: <Icon source="content_copy" />, onSelect: handleCopy },
    { value: 'paste', label: 'Paste', onSelect: handlePaste },
  ]}
/>
```

## 仕様 {#contract}

- `open`／`defaultOpen`／`onOpenChange`は、ほかの状態を持つコンポーネントと同じ制御／非制御の形式です。
- `anchorRef`は利用側で用意し、完全に管理するトリガーを参照します。`Menu`はトリガーをレンダーしません。トリガー側で`aria-haspopup="menu"`／`aria-expanded`とクリック時の処理を設定します。これは、開閉状態を利用側が管理する`Dialog`と同様、トリガーに依存しない仕様です。
- `items: readonly MenuItem[]`でメニューの項目を定義します。形式は`{ value, label, onSelect?, leadingIcon?, trailingIcon?, disabled?, checked?, onCheckedChange? }`です。`checked`を省略すると通常の`role="menuitem"`になり、選択時にメニューを閉じます。`checked`を定義すると（`false`でも）、`aria-checked`付きの`role="menuitemcheckbox"`となり、選択しても開いたままです。1回の表示中に複数の設定を切り替えられます。

## キーボード操作 {#keyboard}

| キー | 動作 |
| --- | --- |
| 開く | 有効な最初の項目に実際のフォーカスを移動 |
| ArrowDown / ArrowUp | 有効な項目間でフォーカスを移動し、末尾と先頭を循環 |
| Home / End | 有効な最初／最後の項目に移動 |
| 文字入力 | 入力した文字で始まるラベルを持つ次の項目に移動 |
| Enter / Space | フォーカス中の項目を選択 |
| Escape | 閉じてアンカーにフォーカスを戻す |
| Tab | フォーカスを閉じ込めずに閉じ、ブラウザー標準の順序でTab移動を継続 |

無効な項目はキーボード移動で飛ばされ、クリックもできません。フォーカストラップや背景のinert化は行いません。これは`Dialog`のモーダルパターンではなく、APGのメニューボタンパターンに合わせています。

## 位置決め {#positioning}

ポップアップはまずアンカーと開始辺をそろえ、次に終了辺を試し、それでも収まらなければビューポート内に留めます。縦方向も同様で、アンカーの下、上の順に試してから位置を調整します。アンカーの幅にかかわらず幅は112〜280pxに収まります。表示中はスクロールとウィンドウのサイズ変更に応じて位置を更新します。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーションの値は1つの`--m3e-comp-menu-*`登録にまとめられ、`Select`のポップアップリストボックスでもそのまま再利用されます。テーマの上書きは`Material3Provider`のスコープ内で適用されます。`Menu`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
