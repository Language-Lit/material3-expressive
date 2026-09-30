# Tooltip

`Tooltip`は、利用側で用意したトリガーに結び付く、操作できない説明をポータル表示します。`Menu`と異なり、アンカー上のホバー、フォーカス、`Escape`による表示／非表示の操作も行うため、追加の配線は不要です。

```tsx
import { useRef } from 'react'
import { Icon, IconButton, Tooltip } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

const anchorRef = useRef<HTMLButtonElement>(null)

<IconButton ref={anchorRef} aria-label="Favorite">
  <Icon source="star" />
</IconButton>
<Tooltip anchorRef={anchorRef} content="Add to favorites" />
```

## 仕様 {#contract}

- `anchorRef`は利用側で用意して完全に管理するトリガーを参照します。これは`Menu`／`Dialog`と同じくトリガーに依存しない仕様です。`Menu`と異なり、トリガーにクリックや`aria-expanded`の設定は不要です。`Tooltip`がアンカーにホバー／フォーカスのリスナーを追加し、表示中は`aria-describedby`を直接管理します。
- `content`は必須の本文です。`variant`の既定値は`'plain'`です。`'rich'`を指定すると本文の上に任意の`subhead`を追加し、大きなコンテナーを使います。どちらのバリアントも操作できません。`role="tooltip"`にはフォーカス可能な内容を置けないため、アクションボタン付きのバリアントはありません。
- `placement`の既定値は`'top'`です。`'top'`、`'bottom'`、`'start'`、`'end'`を指定でき、指定位置がビューポート端に重なる場合は反対側に切り替わります。
- 高度な用途では`open`／`defaultOpen`／`onOpenChange`を使って制御できます。これはほかの状態を持つコンポーネントと同じ形式です。

## 動作 {#behavior}

アンカーにポインターが乗るかキーボードフォーカスが当たると、すぐに表示します。ポインターが離れるかフォーカスが外れると、Tooltip自体のポップオーバーにポインターが移動した場合を除いて、すぐに非表示にします。`Escape`キーでも閉じます。位置は交差軸の中央に合わせ、重なる場合は反対側に切り替えてビューポート端に収めます。表示中はスクロールとウィンドウのサイズ変更に応じて位置を更新します。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーションの値は1つの`--m3e-comp-tooltip-*`登録にまとめられ、2つのバリアント用に`plain-*`と`rich-*`のグループに分かれています。テーマの上書きは`Material3Provider`のスコープ内で適用されます。`Tooltip`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
