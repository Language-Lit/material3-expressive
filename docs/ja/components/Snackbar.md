# Snackbar

`Snackbar`は画面下部に固定される、一時的なステータスメッセージをポータル表示します。キューではなく単一の制御可能なコンポーネントです。複数のメッセージをキューに入れる場合は、利用側の状態で管理します。

```tsx
import { useState } from 'react'
import { Snackbar } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

const [open, setOpen] = useState(false)

<Snackbar
  message="Conversation removed"
  action={{ label: 'Undo', onClick: handleUndo }}
  open={open}
  onOpenChange={setOpen}
/>
```

## 仕様 {#contract}

- `open`／`defaultOpen`／`onOpenChange`は、ほかの状態を持つコンポーネントと同じ制御／非制御の形式です。自動閉じタイマー、アクション、閉じるボタンによってSnackbarが閉じるたびに`onOpenChange`が呼び出されます。
- `message`は必須の本文です。`action?: { label, onClick }`を指定するとインラインのテキストボタンを1つ表示します。押すと`onClick`を呼び出してから閉じます。`dismissible`（既定値`false`）を指定すると閉じるアイコンボタンを表示します。`dismissLabel`（既定値`'Dismiss'`）はそのアクセシブルネームです。
- `duration`には`'short'`（4000ms）、`'long'`（10000ms）、`'indefinite'`、またはミリ秒数を指定できます。既定値はアクションがない場合`'short'`、ある場合`'indefinite'`で、固定されたMaterialソースの既定の決定方法に合わせています。

## 動作 {#behavior}

Snackbarにポインターが乗っている間、またはフォーカスがある間は自動閉じのカウントダウンを一時停止し、離れると残り時間から再開します。長いメッセージを読んだり、アクションを選んだりしている最中に消えることはありません。`role="status"`でフォーカスを奪わずにメッセージを穏やかに通知します。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーションの値はすべて1つの`--m3e-comp-snackbar-*`登録にまとめられています。テーマの上書きは`Material3Provider`のスコープ内で適用されます。`Snackbar`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
