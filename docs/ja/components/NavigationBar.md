# NavigationBar

`NavigationBar`は、選択中の項目のアイコン背後に幅が広がるピル形のハイライトを備えた、画面下部のナビゲーションバーを表示します。固定されたMaterialソースが移植したtabロールではなく、Web標準の`<nav>`／`aria-current`によるナビゲーションの意味付けを使います。ページ内タブ切り替えではなく、アプリ内で持続するナビゲーション領域です（`Tabs`を参照）。

```tsx
import { Icon, NavigationBar } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<NavigationBar
  aria-label="Primary sections"
  items={[
    { value: 'home', label: 'Home', icon: <Icon source="home" /> },
    { value: 'favorites', label: 'Favorites', icon: <Icon source="favorite" /> },
  ]}
/>
```

## 仕様 {#contract}

- `items: readonly NavigationItem[]`でバーの項目を定義します。形式は`{ value, label, icon, selectedIcon?, disabled?, href? }`です。`NavigationRail`、`NavigationDrawer`、`NavigationSuite`でも同じ`NavigationItem`型を使います。
- `value`／`defaultValue`／`onValueChange`は、ほかの状態を持つコンポーネントと同じ制御／非制御の形式です。`defaultValue`を省略すると最初の項目の値が使われます。
- `href`を持つ項目は`<button>`ではなく実際の`<a href>`をレンダーします。これは`Tabs`と同じリンク対応の方法で、ルーターによるナビゲーションに使えます。`href`付きの無効項目はアンカーにネイティブの無効状態がないため`href`を省略しますが、支援技術から判別できるよう`role="link"`は維持します。
- `selectedIcon`を指定すると、その項目の選択中に`icon`を置き換えます（アウトラインから塗りつぶしへのアイコン切り替えなど）。省略すると両状態で`icon`を再利用します。どちらのアイコンも同じ`24×24px`の枠内に収まります。選択アニメーションで幅が変わるのは中央のインジケーター背景だけで、幅0から`56×32px`のピル形状になり、アイコンや項目の占有領域は変わりません。

## トークンと境界 {#tokens-and-boundaries}

色、形状、モーションの値は`--m3e-comp-navigation-bar-*`の1つの登録にまとめられています。テーマの上書きは`Material3Provider`のスコープ内で適用されます。`NavigationBar`は実行時スタイルを注入せず、Next.js、Vite、ルーター、アニメーションライブラリ、非公開のアプリケーションコードをインポートしません。
