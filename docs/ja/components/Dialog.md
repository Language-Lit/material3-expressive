# Dialog

`Dialog`はネイティブの`<dialog>`要素を描画し、その上にMaterialのアイコン、タイトル、コンテンツ、アクションのレイアウトを表示します。ほかの状態を持つコンポーネントと同様に開閉状態を管理します。モーダル／非モーダルの動作、バックドロップ、フォーカストラップ、フォーカスのライフサイクルはすべてブラウザーが担います。

```tsx
import { Button, Dialog, Icon } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<Dialog
  open={open}
  onOpenChange={setOpen}
  role="alertdialog"
  icon={<Icon source="delete" />}
  title="Delete conversation?"
  actions={
    <>
      <Button variant="text" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="text" onClick={() => setOpen(false)}>Delete</Button>
    </>
  }
>
  This removes the conversation and its messages. This action cannot be undone.
</Dialog>
```

## 契約 {#contract}

- `open`／`defaultOpen`／`onOpenChange`は、ほかの状態を持つコンポーネントと同じ制御／非制御の形式です。Escape、外側のクリック、ネイティブの`<form method="dialog">`送信でダイアログが閉じたときに`onOpenChange`を呼び出します。利用側がプログラムから`open`を変更した場合には呼び出しません。
- `icon`、`title`、本文／補足テキスト領域の`children`、`actions`はすべて任意の名前付き領域で、この順に描画されます。省略した領域は余分な間隔を残しません。
- `role`の既定値は`"dialog"`です。中断を伴う確認には`"alertdialog"`を指定できます。
- `className`と`style`はルートの`<dialog>`を対象とします。refも同じ要素を参照します。

制御されたダイアログがネイティブ操作で閉じた場合は、必ず`onOpenChange`で通知します。ただしコールバックを無視しても強制的に開き直しません。ハンドラーが呼ばれた時点ですでにネイティブのclose処理が完了しているためです。ほかの制御／非制御コンポーネントと同様に、`onOpenChange`で新しい値を確定してください。

## モーダルと非モーダル {#modal-and-non-modal}

```tsx
<Dialog open={open} onOpenChange={setOpen} modal={false} title="Playback controls">
  …
</Dialog>
```

| `modal` | ネイティブ呼び出し | バックドロップ | フォーカストラップ | 背景 |
| --- | --- | --- | --- | --- |
| `true`（既定値） | `showModal()` | あり | あり | 操作不可 |
| `false` | `show()` | なし | なし | 操作可能 |

`dismissOnEscape`（既定値`true`）と`dismissOnOutsideClick`（既定値`true`）が適用されるのはモーダルモードだけです。非モーダルダイアログにはクリック可能なバックドロップがなく、ネイティブの既定動作ではEscapeでも閉じません。

## アクセシブルな名前と説明 {#accessible-name-and-description}

`title`がある場合は、明示的に`aria-label`または`aria-labelledby`を渡していない限り、生成したIDを`aria-labelledby`に設定します。`children`がある場合も同様に`aria-describedby`を設定します。`title`、`aria-label`、`aria-labelledby`のいずれかを指定してください。アクセシブルな名前がない場合は開発時に警告します。

初期フォーカスの移動と、ダイアログを閉じたときに開く前のフォーカス位置へ戻す動作は、`modal`の値にかかわらずネイティブの`<dialog>`が担います。設定が必要なライブラリ独自のフォーカス管理コードはありません。

## フォーム {#forms}

```tsx
<Dialog open={open} onOpenChange={setOpen} title="Rename item"
  actions={
    <form method="dialog">
      <Button variant="text" type="submit">Save</Button>
    </form>
  }
>
  <label>
    Name
    <input type="text" defaultValue="Untitled" />
  </label>
</Dialog>
```

ダイアログ内で`<form method="dialog">`を送信すると、追加の接続処理なしにダイアログが閉じ、`onOpenChange(false)`が呼び出されます。Escapeや外側のクリックと同じネイティブの`close`イベントを通じて利用側に通知されます。

## サイズ {#sizing}

ダイアログ自体の幅は280pxから560pxの範囲で、左右の余白を保ちながらビューポートに合わせて調整されます。非常に長いコンテンツはビューポートからはみ出さず、ダイアログ内でスクロールします。全画面用やブレークポイントで切り替わる別バリアントはありません。このコンテンツに合わせた範囲内のサイズが適応動作です。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーション値はすべて1つの`--m3e-comp-dialog-*`登録にまとめています。テーマの上書きは`Material3Provider`内に限定されます。`Dialog`は実行時スタイルを挿入しません。Next.js、Vite、ルーター、アニメーションライブラリ、アプリケーション独自のコードは読み込みません。
