# NavigationDrawer

`NavigationDrawer`はナビゲーション項目を並べた全高のサイドパネルを表示します。一時的なモーダルオーバーレイ、その場で折りたたむ非モーダルパネル、常時表示のパネルという3種類のバリアントがあります。

```tsx
import { useState } from 'react'
import { Icon, NavigationDrawer } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

const [open, setOpen] = useState(false)

<NavigationDrawer
  aria-label="Mail folders"
  variant="modal"
  open={open}
  onOpenChange={setOpen}
  items={[
    { value: 'inbox', label: 'Inbox', icon: <Icon source="inbox" /> },
    { value: 'sent', label: 'Sent', icon: <Icon source="send" /> },
  ]}
/>
```

## 仕様 {#contract}

- `items`と`value`／`defaultValue`／`onValueChange`には、`NavigationBar`と同じ`NavigationItem`形式と、リンクに対応した`href`の動作を使います。
- `variant`の既定値は`'modal'`です。
  - `'modal'`は一時的なオーバーレイです。`Dialog`と同じネイティブ`<dialog>`の方法（`showModal()`／`close()`、Escape／外側クリックで閉じる）を使い、論理方向の開始辺からスライド表示します。`open`／`defaultOpen`／`onOpenChange`で制御します。
  - `'dismissible'`は、重ねずに隣接するコンテンツを押し広げながら、その場で折りたたむ／展開する非モーダルパネルです。こちらも`open`／`defaultOpen`／`onOpenChange`で制御します。
  - `'permanent'`は常に表示されます。`open`／`defaultOpen`／`onOpenChange`は受け付けますが、無視されます。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーションの値は`--m3e-comp-navigation-drawer-*`の1つの登録にまとめられています。テーマの上書きは`Material3Provider`のスコープ内で適用されます。`NavigationDrawer`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
