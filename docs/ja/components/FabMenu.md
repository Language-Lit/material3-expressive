# FabMenu

`FabMenu`はトリガーとなるFABのシェイプ、色、アイコンサイズを切り替えながら、その上に`FabMenuItem`を順番に表示します。

```tsx
import { FabMenu, FabMenuItem } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<FabMenu
  triggerLabel="Create"
  icon={<AddIcon />}
  closeIcon={<CloseIcon />}
  expanded={open}
  onExpandedChange={setOpen}
>
  <FabMenuItem icon={<EditIcon />} onClick={edit}>
    Edit
  </FabMenuItem>
  <FabMenuItem icon={<ShareIcon />} onClick={share}>
    Share
  </FabMenuItem>
</FabMenu>
```

## 契約 {#contract}

- `triggerLabel`（トリガーのアクセシブルな名前）、`icon`（閉じた状態で表示）、`closeIcon`（展開時に表示）は必須です。`expanded`／`defaultExpanded`／`onExpandedChange`は、`IconButton`の`selected`／`onSelectedChange`と同じ制御／非制御のトグル契約です。
- `children`には`FabMenuItem`を渡します。各項目は`icon`、ラベルとなる`children`、`onClick`、`disabled`を受け取ります。閉じた状態の項目は`inert`になり、表示遷移のためDOMに残りながら、アクセシビリティツリーとTab順から除外されます。
- トリガーは`aria-expanded`、`aria-haspopup="true"`、`aria-controls`を公開します。展開中のトリガーにフォーカスがある状態で`ArrowDown`（または`Tab`）を押すと、最初の項目にフォーカスが移ります。
- メニューを実際のナビゲーションやアクションにつなぐ処理は、各`FabMenuItem`の`onClick`に委ねられます。`FabMenu`は前述のdisclosureパターンを超えて、ルーティングやoverlay／menuの意味を管理しません。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーション時間はすべて、`Material3Provider`でスコープされる`--m3e-comp-fab-menu-*` CSSカスタムプロパティから取得します。`FabMenu`は実行時スタイルも`requestAnimationFrame`ループも使いません。トリガーの閉じた状態と展開状態の変化、および各項目の順次表示はCSSトランジションで実現します。
